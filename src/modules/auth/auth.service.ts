import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { createHash } from 'crypto';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from './repositories/auth.repository';
import { JwtTokenService } from '../jwt/jwt-token.service';
import { LoginDto, LoginResponseDto, EmployeeInfoDto } from './dto';
import { TokenUser } from '../jwt/interfaces/jwt.interfaces';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtTokenService: JwtTokenService,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Employee login
   * Supports three modes:
   *  1. Normal login          – email + password
   *  2. Face registration     – email + password + faceLoginId  (first time, saves faceLoginId)
   *  3. Face login            – faceLoginId only                (subsequent logins, no email/password)
   */
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { companyEmail, password, faceLoginId } = loginDto;

    if (!companyEmail && !faceLoginId) {
      throw new BadRequestException(this.i18n.t('auth.emailOrFaceLoginRequired'));
    }

    // ── resolve employee ────────────────────────────────────────
    let employee: Awaited<ReturnType<typeof this.authRepository.findActiveByCompanyEmail>>;

    if (!companyEmail) {
      // ── Mode 3: faceLoginId-only login ─────────────────────────
      employee = await this.authRepository.findActiveByFaceLoginId(
        this.hashFaceLoginId(faceLoginId!),
      );
      if (!employee) {
        throw new UnauthorizedException(this.i18n.t('auth.invalidFaceLogin'));
      }
    } else {
      employee = await this.authRepository.findActiveByCompanyEmail(companyEmail);
      if (!employee) {
        throw new UnauthorizedException(this.i18n.t('auth.invalidCredentials'));
      }

      if (faceLoginId && employee.faceLoginId) {
        // ── Mode 3 variant: email sent but face already registered
        if (this.hashFaceLoginId(faceLoginId) !== employee.faceLoginId) {
          throw new UnauthorizedException(this.i18n.t('auth.invalidFaceLogin'));
        }
      } else {
        // ── Mode 1 or 2: password is required ──────────────────
        if (!employee.password) {
          throw new UnauthorizedException(this.i18n.t('auth.accountNotActivated'));
        }

        if (!password) {
          throw new BadRequestException(this.i18n.t('auth.passwordRequired'));
        }

        const isPasswordValid = await this.comparePasswords(
          password,
          employee.password,
        );

        if (!isPasswordValid) {
          throw new UnauthorizedException(this.i18n.t('auth.invalidCredentials'));
        }

        // ── Mode 2: first-time face registration — hash & persist
        if (faceLoginId) {
          await this.authRepository.updateFaceLoginId(
            employee.id,
            this.hashFaceLoginId(faceLoginId),
          );
        }
      }
    }

    // Prepare user data for JWT token
    const tokenUser: TokenUser = {
      id: employee.id,
      email: employee.companyEmail!,
      name: employee.name,
      role: 'employee',
    };

    // Generate tokens
    const tokens = await this.jwtTokenService.generateAuthTokens(
      tokenUser,
      true,
    );

    // Prepare employee info response
    const employeeInfo: EmployeeInfoDto = {
      id: employee.id,
      name: employee.name,
      companyEmail: employee.companyEmail!,
      jobTitle: employee.jobTitle ?? undefined,
      department: employee.branch?.department
        ? {
            id: employee.branch.department.id,
            name: employee.branch.department.name,
          }
        : undefined,
      branch: employee.branch
        ? {
            id: employee.branch.id,
            nameEn: employee.branch.translations.find((t) => t.language.code === 'en')?.name || '',
            nameAr: employee.branch.translations.find((t) => t.language.code === 'ar')?.name || '',
            latitude: employee.branch.latitude,
            longitude: employee.branch.longitude,
            workShifts: employee.branch.workShifts.map((bws) => ({
              id: bws.workShift.id,
              name: bws.workShift.name,
            })),
          }
        : undefined,
    };

    return {
      user: employeeInfo,
      tokens,
    };
  }

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare plain password with hashed password
   */
  private async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Deterministic SHA-256 hash for faceLoginId.
   * Unlike bcrypt, the same input always produces the same output,
   * which allows a DB lookup by the hash while still protecting the
   * plain-text value in case of a DB breach.
   */
  private hashFaceLoginId(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  /**
   * Validate employee exists and is active
   */
  async validateEmployee(employeeId: string): Promise<EmployeeInfoDto | null> {
    const employee = await this.authRepository.findById(employeeId);

    if (!employee) {
      return null;
    }

    return {
      id: employee.id,
      name: employee.name,
      companyEmail: employee.companyEmail!,
      jobTitle: employee.jobTitle ?? undefined,
      department: employee.branch?.department
        ? {
            id: employee.branch.department.id,
            name: employee.branch.department.name,
          }
        : undefined,
      branch: employee.branch
        ? {
            id: employee.branch.id,
            nameEn: employee.branch.translations.find((t) => t.language.code === 'en')?.name || '',
            nameAr: employee.branch.translations.find((t) => t.language.code === 'ar')?.name || '',
            latitude: employee.branch.latitude,
            longitude: employee.branch.longitude,
            workShifts: employee.branch.workShifts.map((bws) => ({
              id: bws.workShift.id,
              name: bws.workShift.name,
            })),
          }
        : undefined,
    };
  }
}

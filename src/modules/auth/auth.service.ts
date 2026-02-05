import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
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
   *  2. Enable face login     – email + password + enableFaceLogin=true
   *  3. Face login            – employeeId with faceLoginEnabled=true
   */
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { companyEmail, password, employeeId, enableFaceLogin } = loginDto;

    if (!companyEmail && !employeeId) {
      throw new BadRequestException(this.i18n.t('auth.emailOrEmployeeIdRequired'));
    }

    // ── resolve employee ────────────────────────────────────────
    let employee: Awaited<ReturnType<typeof this.authRepository.findActiveByCompanyEmail>>;

    if (employeeId && !companyEmail) {
      // ── Mode 3: Face login by employeeId ─────────────────────────
      employee = await this.authRepository.findById(employeeId);

      if (!employee) {
        throw new UnauthorizedException(this.i18n.t('auth.invalidCredentials'));
      }

      if (!employee.faceLoginEnabled) {
        throw new UnauthorizedException(this.i18n.t('auth.faceLoginNotEnabled'));
      }
    } else {
      // ── Mode 1 or 2: Email + password login ────────────────────
      employee = await this.authRepository.findActiveByCompanyEmail(companyEmail!);

      if (!employee) {
        throw new UnauthorizedException(this.i18n.t('auth.invalidCredentials'));
      }

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

      // ── Mode 2: Enable face login if requested ──────────────────
      if (enableFaceLogin === true && !employee.faceLoginEnabled) {
        await this.authRepository.updateFaceLoginEnabled(employee.id, true);
      } else if (enableFaceLogin === false && employee.faceLoginEnabled) {
        await this.authRepository.updateFaceLoginEnabled(employee.id, false);
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

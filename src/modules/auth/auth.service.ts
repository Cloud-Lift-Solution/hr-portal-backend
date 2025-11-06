import { Injectable, UnauthorizedException } from '@nestjs/common';
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
   * Validates credentials and returns JWT tokens
   */
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { companyEmail, password } = loginDto;

    // Find employee by company email
    const employee =
      await this.authRepository.findActiveByCompanyEmail(companyEmail);

    // Check if employee exists and is active
    if (!employee) {
      throw new UnauthorizedException(this.i18n.t('auth.invalidCredentials'));
    }

    // Check if employee has a password set
    if (!employee.password) {
      throw new UnauthorizedException(this.i18n.t('auth.accountNotActivated'));
    }

    // Validate password
    const isPasswordValid = await this.comparePasswords(
      password,
      employee.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(this.i18n.t('auth.invalidCredentials'));
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
      department: employee.department
        ? {
            id: employee.department.id,
            name: employee.department.name,
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
      department: employee.department
        ? {
            id: employee.department.id,
            name: employee.department.name,
          }
        : undefined,
    };
  }
}

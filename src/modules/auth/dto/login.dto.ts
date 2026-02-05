import { IsEmail, IsString, IsOptional, MinLength, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';

export class LoginDto {
  @ApiProperty({
    description: 'Employee company email. Required for normal login; omitted on face login.',
    example: 'john.doe@company.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: i18nValidationMessage('auth.invalidEmailFormat') })
  @Transform(({ value }) => value?.toLowerCase().trim())
  companyEmail?: string;

  @ApiProperty({
    description: 'Employee password. Required for normal login; omitted on face login.',
    example: 'SecurePass123',
    minLength: 8,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(8, {
    message: i18nValidationMessage('auth.passwordMinLength'),
  })
  password?: string;

  @ApiProperty({
    description: 'Employee ID. Required for face login; omitted on email/password login.',
    example: 'uuid-of-employee',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @ApiProperty({
    description: 'Enable or disable face login for the employee. Send true to enable, false to disable. Only works with email/password login.',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  enableFaceLogin?: boolean;
}

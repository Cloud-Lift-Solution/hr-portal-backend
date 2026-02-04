import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';

export class LoginDto {
  @ApiProperty({
    description: 'Employee company email. Required on normal login and first-time face registration; omitted on subsequent face logins.',
    example: 'john.doe@company.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: i18nValidationMessage('auth.invalidEmailFormat') })
  @Transform(({ value }) => value?.toLowerCase().trim())
  companyEmail?: string;

  @ApiProperty({
    description: 'Employee password. Required on normal login and first-time face registration; omitted on subsequent face logins.',
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
    description: 'Face-login identifier from the device. Send on first login to register, then on every subsequent login to authenticate without a password.',
    required: false,
  })
  @IsOptional()
  @IsString()
  faceLoginId?: string;

}

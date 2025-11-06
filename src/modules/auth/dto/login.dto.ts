import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';

export class LoginDto {
  @ApiProperty({
    description: 'Employee company email',
    example: 'john.doe@company.com',
  })
  @IsNotEmpty({ message: i18nValidationMessage('auth.emailRequired') })
  @IsEmail({}, { message: i18nValidationMessage('auth.invalidEmailFormat') })
  @Transform(({ value }) => value?.toLowerCase().trim())
  companyEmail: string;

  @ApiProperty({
    description: 'Employee password',
    example: 'SecurePass123',
    minLength: 8,
  })
  @IsNotEmpty({ message: i18nValidationMessage('auth.passwordRequired') })
  @IsString()
  @MinLength(8, {
    message: i18nValidationMessage('auth.passwordMinLength'),
  })
  password: string;
}

import { IsString, IsNotEmpty, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateLanguageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  @Matches(/^(en|ar)$/, {
    message: 'code must be either "en" or "ar"',
  })
  @Transform(({ value }) => value?.trim().toLowerCase())
  code: string; // 'en' or 'ar'

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name: string; // 'English' or 'Arabic'
}

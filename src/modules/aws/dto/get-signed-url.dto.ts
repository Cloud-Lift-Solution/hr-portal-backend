import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class GetSignedUrlDto {
  @IsString()
  key: string;

  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(604800) // 7 days max
  expiresIn?: number = 3600; // 1 hour default
}

import { IsString, IsOptional } from 'class-validator';

export class CreateSalaryCertificateRequestDto {
  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  description?: string;
}

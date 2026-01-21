import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class ApproveLoanDto {
  @ApiPropertyOptional({ description: 'Admin notes', example: 'Approved for 6 months' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  note?: string;
}

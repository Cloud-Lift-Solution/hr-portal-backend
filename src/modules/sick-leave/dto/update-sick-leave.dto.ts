import {
  IsUUID,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateSickLeaveDto {
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @IsOptional()
  @IsDateString()
  departureDay?: string;

  @IsOptional()
  @IsDateString()
  returnDay?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  reason?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @Transform(({ value }) => value?.trim())
  attachmentUrl?: string | null;
}

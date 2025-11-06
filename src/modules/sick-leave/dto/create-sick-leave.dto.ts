import {
  IsUUID,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateSickLeaveDto {
  @IsUUID()
  employeeId: string;

  @IsDateString()
  departureDay: string;

  @IsDateString()
  returnDay: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  reason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @Transform(({ value }) => value?.trim())
  attachmentUrl?: string;
}

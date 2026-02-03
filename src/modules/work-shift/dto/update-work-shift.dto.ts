import { IsString, IsOptional, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateWorkShiftDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsString()
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'clockIn must be in HH:mm:ss format (24-hour)',
  })
  clockIn?: string; // Format: "HH:mm:ss" (e.g., "09:00:00")

  @IsString()
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'clockOut must be in HH:mm:ss format (24-hour)',
  })
  clockOut?: string; // Format: "HH:mm:ss" (e.g., "17:00:00")
}

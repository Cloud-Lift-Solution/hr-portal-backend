import { IsOptional, IsString, IsUUID, Matches } from 'class-validator';

export class SickLeaveQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  // current | active | history | ended | upcoming
  @IsOptional()
  @Matches(/^(current|active|history|ended|upcoming)$/i)
  status?: string;

  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @IsOptional()
  @Matches(/^\d{4}$/)
  year?: string;

  // YYYY-MM or date
  @IsOptional()
  @IsString()
  month?: string;
}

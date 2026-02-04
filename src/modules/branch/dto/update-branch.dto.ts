import { IsString, IsOptional, IsBoolean, IsUUID, IsArray, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateBranchDto {
  @IsString()
  @IsOptional()
  nameAr?: string;

  @IsString()
  @IsOptional()
  nameEn?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  openAnyTime?: boolean;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true })
  workShiftIds?: string[]; // Replaces all current work shifts with this list
}

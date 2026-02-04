import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsUUID, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBranchDto {
  @IsString()
  @IsNotEmpty()
  nameAr: string; // Branch name in Arabic

  @IsString()
  @IsNotEmpty()
  nameEn: string; // Branch name in English

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  openAnyTime?: boolean; // Branch open any time flag

  @IsUUID()
  @IsNotEmpty()
  departmentId: string; // Department ID this branch belongs to

  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true })
  workShiftIds?: string[]; // Work shift IDs assigned to this branch
}

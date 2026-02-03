import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsUUID } from 'class-validator';
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

  @IsUUID()
  @IsOptional()
  workShiftId?: string; // Work shift ID for this branch
}

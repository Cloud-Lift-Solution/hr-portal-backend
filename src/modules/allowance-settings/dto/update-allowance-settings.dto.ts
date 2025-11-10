import {
  IsOptional,
  IsBoolean,
  IsArray,
  IsUUID,
  ArrayUnique,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAllowanceSettingsDto {
  @ApiPropertyOptional({
    description: 'Enable/disable vacation allowance rules',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  vacationsEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Enable/disable sick leave allowance rules',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  sickLeaveEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Enable/disable employee exclusion rules',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  excludedEmployeesEnabled?: boolean;

  @ApiPropertyOptional({
    description:
      'Array of allowance IDs that continue during vacation (e.g., housing, phone)',
    type: [String],
    example: ['uuid-1', 'uuid-2'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayUnique()
  allowancesInVacations?: string[];

  @ApiPropertyOptional({
    description:
      'Array of allowance IDs that stop during vacation (e.g., transportation, fuel)',
    type: [String],
    example: ['uuid-3', 'uuid-4'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayUnique()
  allowancesNotInVacations?: string[];

  @ApiPropertyOptional({
    description:
      'Array of allowance IDs that continue during sick leave (e.g., housing)',
    type: [String],
    example: ['uuid-1'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayUnique()
  allowancesInSickLeave?: string[];

  @ApiPropertyOptional({
    description:
      'Array of allowance IDs that stop during sick leave (e.g., transportation, phone)',
    type: [String],
    example: ['uuid-3', 'uuid-4', 'uuid-2'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayUnique()
  allowancesNotInSickLeave?: string[];

  @ApiPropertyOptional({
    description:
      'Array of employee IDs who are exempt from allowance rules (e.g., executives)',
    type: [String],
    example: ['employee-uuid-1', 'employee-uuid-2'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayUnique()
  excludedEmployeeIds?: string[];
}


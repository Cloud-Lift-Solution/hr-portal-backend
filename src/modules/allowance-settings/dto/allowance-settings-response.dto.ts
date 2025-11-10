import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AllowanceInfoDto } from './allowance-info.dto';
import { EmployeeInfoDto } from './employee-info.dto';

export class AllowanceSettingsResponseDto {
  @ApiPropertyOptional({
    description: 'Settings ID (null if no settings exist)',
    nullable: true,
  })
  id: string | null;

  @ApiProperty({ description: 'Vacation rules enabled flag' })
  vacationsEnabled: boolean;

  @ApiProperty({ description: 'Sick leave rules enabled flag' })
  sickLeaveEnabled: boolean;

  @ApiProperty({ description: 'Employee exclusion rules enabled flag' })
  excludedEmployeesEnabled: boolean;

  @ApiProperty({
    description: 'Allowances that continue during vacation',
    type: [AllowanceInfoDto],
  })
  allowancesInVacations: AllowanceInfoDto[];

  @ApiProperty({
    description: 'Allowances that stop during vacation',
    type: [AllowanceInfoDto],
  })
  allowancesNotInVacations: AllowanceInfoDto[];

  @ApiProperty({
    description: 'Allowances that continue during sick leave',
    type: [AllowanceInfoDto],
  })
  allowancesInSickLeave: AllowanceInfoDto[];

  @ApiProperty({
    description: 'Allowances that stop during sick leave',
    type: [AllowanceInfoDto],
  })
  allowancesNotInSickLeave: AllowanceInfoDto[];

  @ApiProperty({
    description: 'Employees exempt from allowance rules',
    type: [EmployeeInfoDto],
  })
  excludedEmployees: EmployeeInfoDto[];

  @ApiPropertyOptional({
    description: 'Creation timestamp (null if no settings exist)',
    nullable: true,
  })
  createdAt: Date | null;

  @ApiPropertyOptional({
    description: 'Last update timestamp (null if no settings exist)',
    nullable: true,
  })
  updatedAt: Date | null;
}


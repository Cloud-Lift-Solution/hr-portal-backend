import { ApiProperty } from '@nestjs/swagger';

export class DepartmentInfoDto {
  @ApiProperty({ description: 'Department ID' })
  id: string;

  @ApiProperty({ description: 'Department name' })
  name: string;
}

export class WorkShiftInfoDto {
  @ApiProperty({ description: 'Work shift ID' })
  id: string;

  @ApiProperty({ description: 'Work shift name' })
  name: string;
}

export class BranchInfoDto {
  @ApiProperty({ description: 'Branch ID' })
  id: string;

  @ApiProperty({ description: 'Branch name in English' })
  nameEn: string;

  @ApiProperty({ description: 'Branch name in Arabic' })
  nameAr: string;

  @ApiProperty({ description: 'Branch latitude', nullable: true })
  latitude: number | null;

  @ApiProperty({ description: 'Branch longitude', nullable: true })
  longitude: number | null;

  @ApiProperty({ description: 'Work shifts assigned to this branch', type: [WorkShiftInfoDto] })
  workShifts: WorkShiftInfoDto[];
}

export class EmployeeInfoDto {
  @ApiProperty({ description: 'Employee ID' })
  id: string;

  @ApiProperty({ description: 'Employee name' })
  name: string;

  @ApiProperty({ description: 'Company email' })
  companyEmail: string;

  @ApiProperty({ description: 'Job title', required: false })
  jobTitle?: string;

  @ApiProperty({
    description: 'Department information',
    type: DepartmentInfoDto,
    required: false,
  })
  department?: DepartmentInfoDto;

  @ApiProperty({
    description: 'Branch information including location and work shifts',
    type: BranchInfoDto,
    required: false,
  })
  branch?: BranchInfoDto;
}

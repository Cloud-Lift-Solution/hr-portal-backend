import { ApiProperty } from '@nestjs/swagger';

export class DepartmentInfoDto {
  @ApiProperty({ description: 'Department ID' })
  id: string;

  @ApiProperty({ description: 'Department name' })
  name: string;
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
}

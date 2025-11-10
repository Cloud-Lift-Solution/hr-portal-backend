import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @ApiProperty({ description: 'Employee company email' })
  companyEmail: string;

  @ApiPropertyOptional({
    description: 'Employee department',
    type: DepartmentInfoDto,
    nullable: true,
  })
  department: DepartmentInfoDto | null;
}


import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectType, PaymentMethod } from '@prisma/client';

export class DepartmentInfoDto {
  @ApiProperty({
    description: 'Department ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Department name',
    example: 'IT Department',
  })
  name: string;
}

export class ProjectResponseDto {
  @ApiProperty({
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Project type',
    enum: ProjectType,
    example: ProjectType.COMPANY_PROJECTS,
  })
  type: ProjectType;

  @ApiProperty({
    description: 'Project name',
    example: 'HR Management System',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Department information',
    type: DepartmentInfoDto,
  })
  department?: DepartmentInfoDto | null;

  @ApiProperty({
    description: 'Client full name',
    example: 'John Doe',
  })
  clientName: string;

  @ApiProperty({
    description: 'Client phone number',
    example: '+96599887766',
  })
  clientPhone: string;

  @ApiProperty({
    description: 'Client email address',
    example: 'john.doe@example.com',
  })
  clientEmail: string;

  @ApiPropertyOptional({
    description: 'Client Civil ID',
    example: '285123456789',
  })
  clientCivilId?: string | null;

  @ApiProperty({
    description: 'Contract signing date',
    example: '2025-11-15T10:30:00Z',
  })
  contractDate: Date;

  @ApiProperty({
    description: 'Contract reference number',
    example: 'CNT-2025-001',
  })
  contractNo: string;

  @ApiProperty({
    description: 'Total project price in KWD',
    example: 15000.0,
  })
  price: number;

  @ApiProperty({
    description: 'Payment split method',
    enum: PaymentMethod,
    example: PaymentMethod.TWO_PAYMENT,
  })
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Number of working days',
    example: 90,
  })
  worksDay: number;

  @ApiProperty({
    description: 'Maintenance period (1-5)',
    example: 1,
  })
  maintaince: number;

  @ApiPropertyOptional({
    description: 'First payment percentage',
    example: 60.0,
  })
  paymentOnePercent?: number | null;

  @ApiPropertyOptional({
    description: 'First payment amount (calculated)',
    example: 9000.0,
  })
  paymentOneAmount?: number | null;

  @ApiPropertyOptional({
    description: 'Second payment percentage',
    example: 40.0,
  })
  paymentTwoPercent?: number | null;

  @ApiPropertyOptional({
    description: 'Second payment amount (calculated)',
    example: 6000.0,
  })
  paymentTwoAmount?: number | null;

  @ApiPropertyOptional({
    description: 'Third payment percentage',
    example: null,
  })
  paymentThreePercent?: number | null;

  @ApiPropertyOptional({
    description: 'Third payment amount (calculated)',
    example: null,
  })
  paymentThreeAmount?: number | null;

  @ApiPropertyOptional({
    description: 'Fourth payment percentage',
    example: null,
  })
  paymentFourPercent?: number | null;

  @ApiPropertyOptional({
    description: 'Fourth payment amount (calculated)',
    example: null,
  })
  paymentFourAmount?: number | null;

  @ApiPropertyOptional({
    description: 'Attachment URL',
    example: 'https://s3.amazonaws.com/bucket/contract-123.pdf',
  })
  attachmentUrl?: string | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class PaginationDto {
  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of projects',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 5,
  })
  totalPages: number;
}

export class PaginatedProjectResponseDto {
  @ApiProperty({
    description: 'Array of projects',
    type: [ProjectResponseDto],
  })
  data: ProjectResponseDto[];

  @ApiProperty({
    description: 'Pagination information',
    type: PaginationDto,
  })
  pagination: PaginationDto;
}


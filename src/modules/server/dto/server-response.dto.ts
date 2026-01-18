import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectType } from '@prisma/client';

export class ProjectInfoDto {
  @ApiProperty({
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Project name',
    example: 'HR Management System',
  })
  name: string;

  @ApiProperty({
    description: 'Project type',
    enum: ProjectType,
    example: ProjectType.HOSTING_PROJECTS,
  })
  type: ProjectType;
}

export class ServerResponseDto {
  @ApiProperty({
    description: 'Server ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  projectId: string;

  @ApiProperty({
    description: 'Project information',
    type: ProjectInfoDto,
  })
  project: ProjectInfoDto;

  @ApiProperty({
    description: 'Server contract reference number',
    example: 'SRV-2025-001',
  })
  contractNo: string;

  @ApiProperty({
    description: 'Server/hosting price',
    example: 5000.0,
  })
  price: number;

  @ApiProperty({
    description: 'Package/plan number or identifier',
    example: 'PKG-001',
  })
  packageNum: string;

  @ApiProperty({
    description: 'Service start date',
    example: '2025-01-01T00:00:00.000Z',
  })
  startDate: Date;

  @ApiProperty({
    description: 'Service end date',
    example: '2025-12-31T00:00:00.000Z',
  })
  endDate: Date;

  @ApiProperty({
    description: 'Duration in days (calculated)',
    example: 365,
  })
  durationDays: number;

  @ApiProperty({
    description: 'Whether server is currently active (calculated)',
    example: true,
  })
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Attachment URL',
    example: 'https://s3.amazonaws.com/bucket/server-contract.pdf',
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
    description: 'Total number of servers',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 5,
  })
  totalPages: number;
}

export class PaginatedServerResponseDto {
  @ApiProperty({
    description: 'Array of servers',
    type: [ServerResponseDto],
  })
  data: ServerResponseDto[];

  @ApiProperty({
    description: 'Pagination information',
    type: PaginationDto,
  })
  pagination: PaginationDto;
}


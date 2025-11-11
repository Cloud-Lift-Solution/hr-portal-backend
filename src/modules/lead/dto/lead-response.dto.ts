import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LeadResponseDto {
  @ApiProperty({
    description: 'Lead ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Lead name',
    example: 'Enterprise Software Solution',
  })
  leadName: string;

  @ApiProperty({
    description: 'Client name',
    example: 'John Doe',
  })
  clientName: string;

  @ApiProperty({
    description: 'Client phone number',
    example: '+1234567890',
  })
  clientPhone: string;

  @ApiProperty({
    description: 'Client email address',
    example: 'john.doe@example.com',
  })
  clientEmail: string;

  @ApiProperty({
    description: 'Reference or lead source',
    example: 'Referred by existing client',
  })
  reference: string;

  @ApiPropertyOptional({
    description: 'Attachment URL',
    example: 'https://example.com/document.pdf',
  })
  attachmentUrl?: string;

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

export class PaginatedLeadResponseDto {
  @ApiProperty({
    description: 'Array of leads',
    type: [LeadResponseDto],
  })
  data: LeadResponseDto[];

  @ApiProperty({
    description: 'Total number of leads',
    example: 100,
  })
  total: number;

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
    description: 'Total number of pages',
    example: 5,
  })
  totalPages: number;
}


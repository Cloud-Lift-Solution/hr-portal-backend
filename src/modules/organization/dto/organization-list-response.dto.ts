import { ApiProperty } from '@nestjs/swagger';
import { OrganizationResponseDto } from './organization-response.dto';

export class OrganizationListResponseDto {
  @ApiProperty({
    description: 'List of organizations',
    type: [OrganizationResponseDto],
  })
  data: OrganizationResponseDto[];

  @ApiProperty({ description: 'Pagination metadata' })
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}


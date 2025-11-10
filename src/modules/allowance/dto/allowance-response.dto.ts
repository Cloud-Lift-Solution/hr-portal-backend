import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AllowanceResponseDto {
  @ApiProperty({ description: 'Allowance ID' })
  id: string;

  @ApiProperty({ description: 'Allowance name' })
  name: string;

  @ApiProperty({ description: 'Allowance amount' })
  fees: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class AllowanceListResponseDto {
  @ApiProperty({
    description: 'List of allowances',
    type: [AllowanceResponseDto],
  })
  data: AllowanceResponseDto[];

  @ApiProperty({ description: 'Pagination metadata' })
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class DeleteAllowanceResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AttendanceHistoryItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  clockInTime: Date;

  @ApiPropertyOptional()
  clockOutTime: Date | null;

  @ApiPropertyOptional()
  totalHours: number | null;

  @ApiProperty()
  totalBreakMinutes: number;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  clockInLatitude?: number;

  @ApiPropertyOptional()
  clockInLongitude?: number;

  @ApiPropertyOptional()
  clockInAccuracy?: number;

  @ApiPropertyOptional()
  clockInAddress?: string;

  @ApiPropertyOptional()
  clockOutLatitude?: number;

  @ApiPropertyOptional()
  clockOutLongitude?: number;

  @ApiPropertyOptional()
  clockOutAccuracy?: number;

  @ApiPropertyOptional()
  clockOutAddress?: string;
}

export class PaginationMetaDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPreviousPage: boolean;
}

export class AttendanceHistoryResponseDto {
  @ApiProperty({ type: [AttendanceHistoryItemDto] })
  data: AttendanceHistoryItemDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

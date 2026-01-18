import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClockOutResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  employeeId: string;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  clockInTime: Date;

  @ApiProperty()
  clockOutTime: Date;

  @ApiProperty()
  totalBreakMinutes: number;

  @ApiProperty()
  totalHours: number;

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

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AttendanceStatusDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  clockInTime: Date;

  @ApiPropertyOptional()
  clockOutTime: Date | null;

  @ApiProperty()
  totalBreakMinutes: number;

  @ApiPropertyOptional()
  totalHours: number | null;

  @ApiPropertyOptional()
  currentWorkingHours: number | null;

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

export class ActiveBreakDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  breakStart: Date;

  @ApiProperty()
  currentBreakMinutes: number;
}

export class TodayStatusResponseDto {
  @ApiPropertyOptional()
  attendance: AttendanceStatusDto | null;

  @ApiPropertyOptional()
  activeBreak: ActiveBreakDto | null;
}

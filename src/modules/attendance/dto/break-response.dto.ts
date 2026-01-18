import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BreakResponseDto {
  @ApiProperty()
  attendanceId: string;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  breakDurationMinutes?: number;

  @ApiPropertyOptional()
  totalBreakMinutes?: number;

  @ApiPropertyOptional()
  breakStart?: Date;
}

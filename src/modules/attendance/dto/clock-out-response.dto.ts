import { ApiProperty } from '@nestjs/swagger';

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
}

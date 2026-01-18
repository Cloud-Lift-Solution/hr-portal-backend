import { ApiProperty } from '@nestjs/swagger';

export class ClockInResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  employeeId: string;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  clockInTime: Date;

  @ApiProperty()
  status: string;

  @ApiProperty()
  totalBreakMinutes: number;

  @ApiProperty()
  currentWorkingHours: number;
}

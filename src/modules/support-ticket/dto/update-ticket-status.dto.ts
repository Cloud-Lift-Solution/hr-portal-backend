import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { TicketStatus } from '@prisma/client';

export class UpdateTicketStatusDto {
  @ApiProperty({ description: 'Ticket status', enum: TicketStatus, example: TicketStatus.CLOSED })
  @IsEnum(TicketStatus)
  @IsNotEmpty()
  status: TicketStatus;
}

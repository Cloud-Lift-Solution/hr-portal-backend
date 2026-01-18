import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsUUID } from 'class-validator';
import { TicketPriority } from '@prisma/client';

export class CreateSupportTicketDto {
  @ApiProperty({ description: 'Ticket title', example: 'Leave request not showing' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Ticket description', example: 'Need to update my phone number and address.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Category ID', example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ description: 'Priority level', enum: TicketPriority, example: TicketPriority.HIGH })
  @IsEnum(TicketPriority)
  @IsNotEmpty()
  priority: TicketPriority;
}

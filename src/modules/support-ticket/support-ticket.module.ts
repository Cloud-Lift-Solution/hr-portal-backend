import { Module } from '@nestjs/common';
import { SupportTicketController } from './support-ticket.controller';
import { SupportTicketService } from './support-ticket.service';
import { SupportTicketRepository } from './repositories/support-ticket.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SupportTicketController],
  providers: [SupportTicketService, SupportTicketRepository],
  exports: [SupportTicketService],
})
export class SupportTicketModule {}

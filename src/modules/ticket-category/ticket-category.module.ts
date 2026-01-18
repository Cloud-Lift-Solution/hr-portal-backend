import { Module } from '@nestjs/common';
import { TicketCategoryController } from './ticket-category.controller';
import { TicketCategoryService } from './ticket-category.service';
import { TicketCategoryRepository } from './repositories/ticket-category.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TicketCategoryController],
  providers: [TicketCategoryService, TicketCategoryRepository],
  exports: [TicketCategoryService],
})
export class TicketCategoryModule {}

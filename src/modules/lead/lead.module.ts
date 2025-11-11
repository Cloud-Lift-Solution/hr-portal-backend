import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { LeadController } from './lead.controller';
import { LeadService } from './lead.service';
import { LeadRepository } from './repositories/lead.repository';

@Module({
  imports: [PrismaModule],
  controllers: [LeadController],
  providers: [LeadService, LeadRepository],
  exports: [LeadService, LeadRepository],
})
export class LeadModule {}


import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { WorkShiftController } from './work-shift.controller';
import { WorkShiftService } from './work-shift.service';
import { WorkShiftRepository } from './repositories/work-shift.repository';

@Module({
  imports: [PrismaModule],
  controllers: [WorkShiftController],
  providers: [WorkShiftService, WorkShiftRepository],
  exports: [WorkShiftService, WorkShiftRepository],
})
export class WorkShiftModule {}

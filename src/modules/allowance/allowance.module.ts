import { Module } from '@nestjs/common';
import { AllowanceController } from './allowance.controller';
import { AllowanceService } from './allowance.service';
import { AllowanceRepository } from './repositories/allowance.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AllowanceController],
  providers: [AllowanceService, AllowanceRepository],
  exports: [AllowanceService],
})
export class AllowanceModule {}

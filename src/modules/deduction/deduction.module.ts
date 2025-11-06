import { Module } from '@nestjs/common';
import { DeductionController } from './deduction.controller';
import { DeductionService } from './deduction.service';
import { DeductionRepository } from './repositories/deduction.repository';
import { PrismaModule } from '../../prisma/prisma.module';
import { EmployeeModule } from '../employee/employee.module';

@Module({
  imports: [PrismaModule, EmployeeModule],
  controllers: [DeductionController],
  providers: [DeductionService, DeductionRepository],
})
export class DeductionModule {}

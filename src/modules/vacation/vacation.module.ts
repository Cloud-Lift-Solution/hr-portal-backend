import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { EmployeeModule } from '../employee/employee.module';
import { VacationController } from './vacation.controller';
import { VacationService } from './vacation.service';
import { VacationRepository } from './repositories/vacation.repository';

@Module({
  imports: [PrismaModule, EmployeeModule],
  controllers: [VacationController],
  providers: [VacationService, VacationRepository],
})
export class VacationModule {}



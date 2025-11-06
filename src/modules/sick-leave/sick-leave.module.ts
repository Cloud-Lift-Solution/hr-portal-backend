import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { EmployeeModule } from '../employee/employee.module';
import { SickLeaveController } from './sick-leave.controller';
import { SickLeaveService } from './sick-leave.service';
import { SickLeaveRepository } from './repositories/sick-leave.repository';

@Module({
  imports: [PrismaModule, EmployeeModule],
  controllers: [SickLeaveController],
  providers: [SickLeaveService, SickLeaveRepository],
})
export class SickLeaveModule {}

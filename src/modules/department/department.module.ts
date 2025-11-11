import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { DepartmentRepository } from './repositories/department.repository';

@Module({
  imports: [PrismaModule],
  controllers: [DepartmentController],
  providers: [DepartmentService, DepartmentRepository],
  exports: [DepartmentService, DepartmentRepository],
})
export class DepartmentModule {}

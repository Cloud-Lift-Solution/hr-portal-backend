import { Module } from '@nestjs/common';
import { AllowanceSettingsController } from './allowance-settings.controller';
import { AllowanceSettingsService } from './allowance-settings.service';
import { AllowanceSettingsRepository } from './repositories/allowance-settings.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AllowanceSettingsController],
  providers: [AllowanceSettingsService, AllowanceSettingsRepository],
  exports: [AllowanceSettingsService],
})
export class AllowanceSettingsModule {}


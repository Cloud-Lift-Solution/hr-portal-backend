import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { LanguageController } from './language.controller';
import { LanguageService } from './language.service';
import { LanguageRepository } from './repositories/language.repository';

@Module({
  imports: [PrismaModule],
  controllers: [LanguageController],
  providers: [LanguageService, LanguageRepository],
  exports: [LanguageService, LanguageRepository],
})
export class LanguageModule {}

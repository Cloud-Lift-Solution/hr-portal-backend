import { Module } from '@nestjs/common';
import { CompanyPolicyController } from './company-policy.controller';
import { CompanyPolicyService } from './company-policy.service';
import { CompanyPolicyRepository } from './repositories/company-policy.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CompanyPolicyController],
  providers: [CompanyPolicyService, CompanyPolicyRepository],
  exports: [CompanyPolicyService],
})
export class CompanyPolicyModule {}

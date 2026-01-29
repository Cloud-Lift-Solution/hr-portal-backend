import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { JwtModule } from '../jwt/jwt.module';
import { VacationRequestController } from './vacation-request/vacation-request.controller';
import { VacationRequestService } from './vacation-request/vacation-request.service';
import { SickLeaveRequestController } from './sick-leave-request/sick-leave-request.controller';
import { SickLeaveRequestService } from './sick-leave-request/sick-leave-request.service';
import { VacationExtensionRequestController } from './vacation-extension-request/vacation-extension-request.controller';
import { VacationExtensionRequestService } from './vacation-extension-request/vacation-extension-request.service';
import { VacationCancellationRequestController } from './vacation-cancellation-request/vacation-cancellation-request.controller';
import { VacationCancellationRequestService } from './vacation-cancellation-request/vacation-cancellation-request.service';
import { SalaryAdvanceRequestController } from './salary-advance-request/salary-advance-request.controller';
import { SalaryAdvanceRequestService } from './salary-advance-request/salary-advance-request.service';
import { SalaryCertificateRequestController } from './salary-certificate-request/salary-certificate-request.controller';
import { SalaryCertificateRequestService } from './salary-certificate-request/salary-certificate-request.service';
import { UnifiedRequestsController } from './unified-requests.controller';
import { UnifiedRequestsService } from './unified-requests.service';

@Module({
  imports: [PrismaModule, JwtModule],
  controllers: [
    UnifiedRequestsController,
    VacationRequestController,
    SickLeaveRequestController,
    VacationExtensionRequestController,
    VacationCancellationRequestController,
    SalaryAdvanceRequestController,
    SalaryCertificateRequestController,
  ],
  providers: [
    UnifiedRequestsService,
    VacationRequestService,
    SickLeaveRequestService,
    VacationExtensionRequestService,
    VacationCancellationRequestService,
    SalaryAdvanceRequestService,
    SalaryCertificateRequestService,
  ],
  exports: [
    UnifiedRequestsService,
    VacationRequestService,
    SickLeaveRequestService,
    VacationExtensionRequestService,
    VacationCancellationRequestService,
    SalaryAdvanceRequestService,
    SalaryCertificateRequestService,
  ],
})
export class RequestsModule {}

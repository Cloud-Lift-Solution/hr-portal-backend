import { Module, MiddlewareConsumer } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { I18nModule } from 'nestjs-i18n';
import { i18nConfig } from './config/i18n.config';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

import { UserModule } from './modules/user/user.module';
import { JwtModule } from './modules/jwt/jwt.module';
import { AuthModule } from './modules/auth/auth.module';
import { AssetModule } from './modules/asset/asset.module';
import { DepartmentModule } from './modules/department/department.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { DeductionModule } from './modules/deduction/deduction.module';
import { VacationModule } from './modules/vacation/vacation.module';
import { SickLeaveModule } from './modules/sick-leave/sick-leave.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { LoanModule } from './modules/loan/loan.module';
import { AllowanceModule } from './modules/allowance/allowance.module';
import { AllowanceSettingsModule } from './modules/allowance-settings/allowance-settings.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { LeadModule } from './modules/lead/lead.module';
import { ProjectModule } from './modules/project/project.module';
import { ServerModule } from './modules/server/server.module';
import { TicketCategoryModule } from './modules/ticket-category/ticket-category.module';
import { SupportTicketModule } from './modules/support-ticket/support-ticket.module';
import { RequestsModule } from './modules/requests/requests.module';
import { UploadModule } from './modules/upload/upload.module';
import { WorkShiftModule } from './modules/work-shift/work-shift.module';

@Module({
  imports: [
    I18nModule.forRoot(i18nConfig),
    PrismaModule,
    UserModule,
    JwtModule,
    AuthModule,
    AssetModule,
    DepartmentModule,
    EmployeeModule,
    DeductionModule,
    VacationModule,
    SickLeaveModule,
    AttendanceModule,
    LoanModule,
    AllowanceModule,
    AllowanceSettingsModule,
    OrganizationModule,
    LeadModule,
    ProjectModule,
    ServerModule,
    TicketCategoryModule,
    SupportTicketModule,
    RequestsModule,
    UploadModule,
    WorkShiftModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

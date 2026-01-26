import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { JwtModule } from '../jwt/jwt.module';
import { VacationRequestController } from './vacation-request/vacation-request.controller';
import { VacationRequestService } from './vacation-request/vacation-request.service';

@Module({
  imports: [PrismaModule, JwtModule],
  controllers: [VacationRequestController],
  providers: [VacationRequestService],
  exports: [VacationRequestService],
})
export class RequestsModule {}

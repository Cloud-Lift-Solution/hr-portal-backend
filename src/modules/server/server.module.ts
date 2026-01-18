import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ProjectModule } from '../project/project.module';
import { ServerController } from './server.controller';
import { ServerService } from './server.service';
import { ServerRepository } from './repositories/server.repository';

@Module({
  imports: [PrismaModule, ProjectModule],
  controllers: [ServerController],
  providers: [ServerService, ServerRepository],
  exports: [ServerService, ServerRepository],
})
export class ServerModule {}


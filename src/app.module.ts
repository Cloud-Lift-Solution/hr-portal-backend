import { Module, MiddlewareConsumer } from '@nestjs/common';
import { I18nModule } from 'nestjs-i18n';
import { i18nConfig } from './config/i18n.config';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';

import { UserModule } from './modules/user/user.module';
import { JwtModule } from './modules/jwt/jwt.module';
import { AssetModule } from './modules/asset/asset.module';
import { DepartmentModule } from './modules/department/department.module';

@Module({
  imports: [
    I18nModule.forRoot(i18nConfig),
    PrismaModule,
    UserModule,
    JwtModule,
    AssetModule,
    DepartmentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

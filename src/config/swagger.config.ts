import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('HR Portal API')
  .setDescription(
    'Complete API documentation for HR Portal system with asset management',
  )
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Enter JWT token',
      in: 'header',
    },
    'JWT-auth',
  )
  .addTag('Assets', 'Asset management endpoints')
  .addTag('Departments', 'Department management endpoints')
  .addTag('Users', 'User management endpoints')
  .build();


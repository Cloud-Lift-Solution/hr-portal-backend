import { IsOptional, IsString, IsUUID, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum ServerStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  ALL = 'all',
}

export class ServerQueryDto {
  @ApiPropertyOptional({
    description: 'Search by contract number or package number',
    example: 'PKG-001',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by project ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4')
  projectId?: string;

  @ApiPropertyOptional({
    description: 'Filter by server status',
    enum: ServerStatus,
    example: ServerStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ServerStatus)
  status?: ServerStatus;

  @ApiPropertyOptional({
    description: 'Filter by start date month (1-12)',
    minimum: 1,
    maximum: 12,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  startMonth?: number;

  @ApiPropertyOptional({
    description: 'Filter by start date year',
    minimum: 2000,
    maximum: 2100,
    example: 2025,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  startYear?: number;

  @ApiPropertyOptional({
    description: 'Filter by end date month (1-12)',
    minimum: 1,
    maximum: 12,
    example: 12,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  endMonth?: number;

  @ApiPropertyOptional({
    description: 'Filter by end date year',
    minimum: 2000,
    maximum: 2100,
    example: 2025,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  endYear?: number;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 20,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}


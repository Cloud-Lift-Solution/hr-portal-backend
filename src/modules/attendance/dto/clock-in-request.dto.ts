import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ClockInRequestDto {
  @ApiPropertyOptional({ description: 'GPS latitude coordinate', example: 29.3759 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ description: 'GPS longitude coordinate', example: 47.9774 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({ description: 'GPS accuracy in meters', example: 10.5 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  accuracy?: number;

  @ApiPropertyOptional({ description: 'Reverse geocoded address', example: 'Kuwait City, Kuwait' })
  @IsOptional()
  @IsString()
  address?: string;
}

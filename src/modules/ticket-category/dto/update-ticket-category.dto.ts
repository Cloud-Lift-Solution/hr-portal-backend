import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateTicketCategoryDto {
  @ApiPropertyOptional({ description: 'Category name in Arabic', example: 'طلب إجازة' })
  @IsString()
  @IsOptional()
  nameAr?: string;

  @ApiPropertyOptional({ description: 'Category name in English', example: 'Leave Request' })
  @IsString()
  @IsOptional()
  nameEn?: string;
}

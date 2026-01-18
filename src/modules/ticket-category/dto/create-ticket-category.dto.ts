import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTicketCategoryDto {
  @ApiProperty({ description: 'Category name in Arabic', example: 'طلب إجازة' })
  @IsString()
  @IsNotEmpty()
  nameAr: string;

  @ApiProperty({ description: 'Category name in English', example: 'Leave Request' })
  @IsString()
  @IsNotEmpty()
  nameEn: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class TicketCategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ description: 'Category name (localized based on Accept-Language header)' })
  name: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class TicketCategoryDetailResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ description: 'Category name in Arabic' })
  nameAr: string;

  @ApiProperty({ description: 'Category name in English' })
  nameEn: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

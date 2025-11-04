import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  ValidateNested,
  IsArray,
  ArrayMinSize,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { AssetType } from '@prisma/client';
import { AssetCategoryDto } from './asset-category.dto';

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsEnum(AssetType)
  @IsNotEmpty()
  type: AssetType;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  @ValidateIf((o) =>
    [
      AssetType.WITH_SERIAL_NUMBER,
      AssetType.WITH_SERIAL_NUMBER_AND_CATEGORIES,
    ].includes(o.type),
  )
  @IsNotEmpty({ message: 'Serial number is required for this asset type' })
  serialNumber?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssetCategoryDto)
  @ArrayMinSize(1)
  @ValidateIf((o) =>
    [
      AssetType.WITH_CATEGORIES,
      AssetType.WITH_SERIAL_NUMBER_AND_CATEGORIES,
    ].includes(o.type),
  )
  @IsNotEmpty({ message: 'Categories are required for this asset type' })
  categories?: AssetCategoryDto[];
}

import {
  IsString,
  IsOptional,
  ValidateNested,
  IsArray,
  ArrayMinSize,
  MaxLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { AssetCategoryDto } from './asset-category.dto';

export class UpdateAssetDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  serialNumber?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AssetCategoryDto)
  @ArrayMinSize(1)
  categories?: AssetCategoryDto[];
}

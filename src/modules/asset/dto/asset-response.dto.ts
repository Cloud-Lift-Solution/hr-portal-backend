import { AssetType } from '@prisma/client';

export class AssetCategoryResponseDto {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AssetResponseDto {
  id: string;
  name: string;
  serialNumber: string | null;
  type: AssetType;
  categories: AssetCategoryResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

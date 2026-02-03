export class AssetCategoryDto {
  id: string;
  name: string;
}

export class EmployeeAssetResponseDto {
  id: string;
  name: string;
  serialNumber?: string;
  type: string;
  categories: AssetCategoryDto[];
  assignedAt: Date;
}

import { IsUUID, IsNotEmpty } from 'class-validator';

export class AssignAssetDto {
  @IsUUID()
  @IsNotEmpty()
  assetId: string;
}


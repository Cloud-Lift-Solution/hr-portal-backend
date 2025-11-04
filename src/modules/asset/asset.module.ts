import { Module } from '@nestjs/common';
import { AssetController } from './asset.controller';
import { AssetService } from './asset.service';
import { AssetRepository } from './repositories/asset.repository';

@Module({
  controllers: [AssetController],
  providers: [AssetService, AssetRepository],
  exports: [AssetService],
})
export class AssetModule {}

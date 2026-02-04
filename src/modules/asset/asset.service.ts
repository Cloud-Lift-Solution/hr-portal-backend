import {
  Injectable,
  Logger,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { AssetType } from '@prisma/client';
import { AssetRepository } from './repositories/asset.repository';
import { CreateAssetDto, UpdateAssetDto, AssetResponseDto } from './dto';
import { TranslatedException } from '../../common/exceptions/business.exception';
import {
  PaginatedResult,
  PaginationUtil,
} from '../../common/utils/pagination.util';

@Injectable()
export class AssetService {
  private readonly logger = new Logger(AssetService.name);

  constructor(
    private readonly assetRepository: AssetRepository,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Get all assets with pagination
   */
  async findAll(
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<AssetResponseDto>> {
    // Normalize pagination parameters
    const normalizedPage = PaginationUtil.normalizePage(page);
    const normalizedLimit = PaginationUtil.normalizeLimit(limit);

    // Calculate skip
    const skip = PaginationUtil.getSkip(normalizedPage, normalizedLimit);

    // Get assets and total count
    const [assets, total] = await Promise.all([
      this.assetRepository.findAll(skip, normalizedLimit),
      this.assetRepository.count(),
    ]);

    // Return paginated result
    return PaginationUtil.createPaginatedResult(
      assets as AssetResponseDto[],
      normalizedPage,
      normalizedLimit,
      total,
    );
  }

  /**
   * Get single asset by ID
   */
  async findOne(id: string): Promise<AssetResponseDto> {
    const asset = await this.assetRepository.findById(id);

    if (!asset) {
      throw TranslatedException.notFound('asset.notFound');
    }

    return asset as AssetResponseDto;
  }

  /**
   * Create new asset
   */
  async create(
    createAssetDto: CreateAssetDto,
    lang: string,
  ): Promise<AssetResponseDto> {
    // Validate serial number uniqueness if provided
    if (createAssetDto.serialNumber) {
      await this.validateSerialNumberUniqueness(
        createAssetDto.serialNumber,
        lang,
      );
    }

    // Validate data based on asset type
    this.validateAssetData(createAssetDto);

    // Create asset
    const asset = await this.assetRepository.create({
      name: createAssetDto.name,
      type: createAssetDto.type,
      serialNumber: createAssetDto.serialNumber,
      categories: createAssetDto.categories,
    });

    return asset as AssetResponseDto;
  }

  /**
   * Update existing asset
   */
  async update(
    id: string,
    updateAssetDto: UpdateAssetDto,
    lang: string,
  ): Promise<AssetResponseDto> {
    // Check if asset exists
    await this.ensureAssetExists(id);

    // Validate serial number uniqueness if provided
    if (updateAssetDto.serialNumber) {
      await this.validateSerialNumberUniqueness(
        updateAssetDto.serialNumber,
        lang,
        id,
      );
    }

    // Update asset
    const updatedAsset = await this.assetRepository.update(id, {
      name: updateAssetDto.name,
      serialNumber: updateAssetDto.serialNumber,
      categories: updateAssetDto.categories,
    });

    return updatedAsset as AssetResponseDto;
  }

  /**
   * Delete asset
   */
  async remove(id: string, lang: string): Promise<{ message: string }> {
    // Check if asset exists
    await this.ensureAssetExists(id);

    // Delete asset
    await this.assetRepository.delete(id);

    return {
      message: await this.i18n.translate('asset.deleteSuccess', { lang }),
    };
  }

  /**
   * Validate asset data based on type
   */
  private validateAssetData(dto: CreateAssetDto): void {
    const { type, serialNumber, categories } = dto;

    switch (type) {
      case AssetType.WITH_SERIAL_NUMBER:
        if (!serialNumber) {
          throw new BadRequestException(
            'Serial number is required for WITH_SERIAL_NUMBER type',
          );
        }
        break;

      case AssetType.WITH_CATEGORIES:
        if (!categories || categories.length === 0) {
          throw new BadRequestException(
            'Categories are required for WITH_CATEGORIES type',
          );
        }
        break;

      case AssetType.WITH_SERIAL_NUMBER_AND_CATEGORIES:
        if (!serialNumber) {
          throw new BadRequestException(
            'Serial number is required for WITH_SERIAL_NUMBER_AND_CATEGORIES type',
          );
        }
        if (!categories || categories.length === 0) {
          throw new BadRequestException(
            'Categories are required for WITH_SERIAL_NUMBER_AND_CATEGORIES type',
          );
        }
        break;
    }
  }

  /**
   * Ensure asset exists or throw error
   */
  private async ensureAssetExists(id: string): Promise<void> {
    const exists = await this.assetRepository.exists(id);
    if (!exists) {
      throw TranslatedException.notFound('asset.notFound');
    }
  }

  /**
   * Validate serial number uniqueness
   */
  private async validateSerialNumberUniqueness(
    serialNumber: string,
    lang: string,
    excludeAssetId?: string,
  ): Promise<void> {
    const exists = await this.assetRepository.serialNumberExists(
      serialNumber,
      excludeAssetId,
    );

    if (exists) {
      throw new ConflictException(
        this.i18n.translate('asset.serialNumberExists', { lang }),
      );
    }
  }
}

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags /* ApiBearerAuth */ } from '@nestjs/swagger';
import { AssetService } from './asset.service';
import { CreateAssetDto, UpdateAssetDto, AssetResponseDto } from './dto';
// import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AcceptLanguage } from '../../common/decorators/accept-language.decorator';
import {
  PaginatedResult,
  PaginationUtil,
} from '../../common/utils/pagination.util';

@ApiTags('Assets')
// @ApiBearerAuth('JWT-auth')
@Controller('assets')
@UseInterceptors(ClassSerializerInterceptor)
// @UseGuards(JwtAuthGuard)
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  /**
   * Get all assets with pagination
   * GET /assets?page=1&limit=10
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string,
  ): Promise<PaginatedResult<AssetResponseDto>> {
    const { page, limit } = PaginationUtil.parseParams(pageParam, limitParam);
    return await this.assetService.findAll(page, limit);
  }

  /**
   * Get single asset by ID
   * GET /assets/:id
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<AssetResponseDto> {
    return await this.assetService.findOne(id);
  }

  /**
   * Create new asset
   * POST /assets
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createAssetDto: CreateAssetDto,
    @AcceptLanguage() language: string,
  ): Promise<AssetResponseDto> {
    return await this.assetService.create(createAssetDto, language);
  }

  /**
   * Update existing asset
   * PUT /assets/:id
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateAssetDto: UpdateAssetDto,
    @AcceptLanguage() language: string,
  ): Promise<AssetResponseDto> {
    return await this.assetService.update(id, updateAssetDto, language);
  }

  /**
   * Delete asset
   * DELETE /assets/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @AcceptLanguage() language: string,
  ): Promise<{ message: string }> {
    return await this.assetService.remove(id, language);
  }
}

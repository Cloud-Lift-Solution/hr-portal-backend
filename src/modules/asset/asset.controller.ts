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
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AssetService } from './asset.service';
import { CreateAssetDto, UpdateAssetDto, AssetResponseDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AcceptLanguage } from '../../common/decorators/accept-language.decorator';

@Controller('assets')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  /**
   * Get all assets with pagination
   * GET /assets?page=1&limit=10
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<{
    data: AssetResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
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

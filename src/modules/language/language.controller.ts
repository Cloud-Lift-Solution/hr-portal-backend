import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LanguageService } from './language.service';
import {
  CreateLanguageDto,
  UpdateLanguageDto,
  LanguageResponseDto,
} from './dto';
import { AcceptLanguage } from '../../common/decorators/accept-language.decorator';

@ApiTags('Languages')
// @ApiBearerAuth('JWT-auth') // Commented out for testing - Remove comment to enable JWT auth
@Controller('languages')
@UseInterceptors(ClassSerializerInterceptor)
// @UseGuards(JwtAuthGuard) // Commented out for testing - Remove comment to enable JWT auth
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  /**
   * Get all languages
   * GET /languages
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<LanguageResponseDto[]> {
    return await this.languageService.findAll();
  }

  /**
   * Get single language by ID
   * GET /languages/:id
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<LanguageResponseDto> {
    return await this.languageService.findOne(id);
  }

  /**
   * Create new language
   * POST /languages
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createLanguageDto: CreateLanguageDto,
    @AcceptLanguage() language: string,
  ): Promise<LanguageResponseDto> {
    return await this.languageService.create(createLanguageDto, language);
  }

  /**
   * Update existing language
   * PUT /languages/:id
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateLanguageDto: UpdateLanguageDto,
    @AcceptLanguage() language: string,
  ): Promise<LanguageResponseDto> {
    return await this.languageService.update(id, updateLanguageDto, language);
  }

  /**
   * Delete language
   * DELETE /languages/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @AcceptLanguage() language: string,
  ): Promise<{ message: string }> {
    return await this.languageService.remove(id, language);
  }
}

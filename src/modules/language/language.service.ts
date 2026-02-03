import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { LanguageRepository } from './repositories/language.repository';
import {
  CreateLanguageDto,
  UpdateLanguageDto,
  LanguageResponseDto,
} from './dto';
import { TranslatedException } from '../../common/exceptions/business.exception';

@Injectable()
export class LanguageService {
  private readonly logger = new Logger(LanguageService.name);

  constructor(
    private readonly languageRepository: LanguageRepository,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Get all languages
   */
  async findAll(): Promise<LanguageResponseDto[]> {
    const languages = await this.languageRepository.findAll();
    return languages as LanguageResponseDto[];
  }

  /**
   * Get single language by ID
   */
  async findOne(id: string): Promise<LanguageResponseDto> {
    const language = await this.languageRepository.findById(id);

    if (!language) {
      throw TranslatedException.notFound('language.notFound');
    }

    return language as LanguageResponseDto;
  }

  /**
   * Create new language
   */
  async create(
    createLanguageDto: CreateLanguageDto,
    lang: string,
  ): Promise<LanguageResponseDto> {
    // Check if code already exists
    await this.validateCodeUniqueness(createLanguageDto.code, lang);

    // Create language
    const language = await this.languageRepository.create({
      code: createLanguageDto.code,
      name: createLanguageDto.name,
    });

    return language as LanguageResponseDto;
  }

  /**
   * Update existing language
   */
  async update(
    id: string,
    updateLanguageDto: UpdateLanguageDto,
    lang: string,
  ): Promise<LanguageResponseDto> {
    // Check if language exists
    await this.ensureLanguageExists(id);

    // Update language (only name can be updated, code is immutable)
    const updatedLanguage = await this.languageRepository.update(
      id,
      updateLanguageDto.name!,
    );

    return updatedLanguage as LanguageResponseDto;
  }

  /**
   * Delete language
   */
  async remove(id: string, lang: string): Promise<{ message: string }> {
    // Check if language exists
    await this.ensureLanguageExists(id);

    // Delete language
    await this.languageRepository.delete(id);

    return {
      message: await this.i18n.translate('language.deleteSuccess', { lang }),
    };
  }

  /**
   * Ensure language exists or throw error
   */
  private async ensureLanguageExists(id: string): Promise<void> {
    const exists = await this.languageRepository.exists(id);
    if (!exists) {
      throw TranslatedException.notFound('language.notFound');
    }
  }

  /**
   * Validate language code uniqueness
   */
  private async validateCodeUniqueness(
    code: string,
    lang: string,
    excludeLanguageId?: string,
  ): Promise<void> {
    const exists = await this.languageRepository.codeExists(
      code,
      excludeLanguageId,
    );

    if (exists) {
      throw new ConflictException(
        this.i18n.translate('language.codeExists', { lang }),
      );
    }
  }
}

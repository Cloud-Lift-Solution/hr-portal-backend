import { Injectable, NotFoundException } from '@nestjs/common';
import { TicketCategoryRepository } from './repositories/ticket-category.repository';
import {
  CreateTicketCategoryDto,
  UpdateTicketCategoryDto,
  TicketCategoryResponseDto,
  TicketCategoryDetailResponseDto,
} from './dto';

@Injectable()
export class TicketCategoryService {
  constructor(private readonly repository: TicketCategoryRepository) {}

  /**
   * Create a new ticket category
   */
  async create(dto: CreateTicketCategoryDto): Promise<TicketCategoryDetailResponseDto> {
    const category = await this.repository.create(dto.nameAr, dto.nameEn);
    return this.mapToDetailResponse(category);
  }

  /**
   * Get all ticket categories
   */
  async findAll(language: string = 'en'): Promise<TicketCategoryResponseDto[]> {
    const categories = await this.repository.findAll();
    return categories.map((category) => this.mapToResponse(category, language));
  }

  /**
   * Get all ticket categories with all translations
   */
  async findAllDetailed(): Promise<TicketCategoryDetailResponseDto[]> {
    const categories = await this.repository.findAll();
    return categories.map((category) => this.mapToDetailResponse(category));
  }

  /**
   * Get ticket category by ID
   */
  async findById(id: string): Promise<TicketCategoryDetailResponseDto> {
    const category = await this.repository.findById(id);

    if (!category) {
      throw new NotFoundException('Ticket category not found');
    }

    return this.mapToDetailResponse(category);
  }

  /**
   * Update ticket category
   */
  async update(
    id: string,
    dto: UpdateTicketCategoryDto,
  ): Promise<TicketCategoryDetailResponseDto> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Ticket category not found');
    }

    const updated = await this.repository.update(id, dto.nameAr, dto.nameEn);
    return this.mapToDetailResponse(updated);
  }

  /**
   * Delete ticket category
   */
  async delete(id: string): Promise<void> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Ticket category not found');
    }

    await this.repository.delete(id);
  }

  /**
   * Map category to response with localized name
   */
  private mapToResponse(category: any, language: string): TicketCategoryResponseDto {
    const translation = category.translations.find((t: any) => t.language === language);
    const fallbackTranslation = category.translations[0];

    return {
      id: category.id,
      name: translation?.name || fallbackTranslation?.name || '',
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  /**
   * Map category to detail response with both translations
   */
  private mapToDetailResponse(category: any): TicketCategoryDetailResponseDto {
    const arTranslation = category.translations.find((t: any) => t.language === 'ar');
    const enTranslation = category.translations.find((t: any) => t.language === 'en');

    return {
      id: category.id,
      nameAr: arTranslation?.name || '',
      nameEn: enTranslation?.name || '',
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}

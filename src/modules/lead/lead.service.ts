import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { LeadRepository } from './repositories/lead.repository';
import { CreateLeadDto, UpdateLeadDto, LeadQueryDto, LeadResponseDto, PaginatedLeadResponseDto } from './dto';
import { TranslatedException } from '../../common/exceptions/business.exception';

@Injectable()
export class LeadService {
  constructor(
    private readonly leadRepository: LeadRepository,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Find all leads with filters and pagination
   */
  async findAll(query: LeadQueryDto): Promise<PaginatedLeadResponseDto> {
    const filters = {
      search: query.search,
      month: query.month,
      year: query.year,
      page: query.page || 1,
      limit: query.limit || 20,
    };

    const result = await this.leadRepository.findAllWithPagination(filters);

    return {
      data: result.data.map((lead) => this.mapToResponseDto(lead)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  /**
   * Find a single lead by ID
   */
  async findOne(id: string): Promise<LeadResponseDto> {
    const lead = await this.leadRepository.findById(id);
    
    if (!lead) {
      throw TranslatedException.notFound('lead.notFound');
    }

    return this.mapToResponseDto(lead);
  }

  /**
   * Create a new lead
   */
  async create(dto: CreateLeadDto, lang: string): Promise<LeadResponseDto> {
    // Validate email format (additional validation beyond class-validator)
    this.validateEmail(dto.clientEmail);

    // Validate phone format (additional validation)
    this.validatePhone(dto.clientPhone);

    // Check for duplicate client email (optional business rule)
    const emailExists = await this.leadRepository.existsByClientEmail(dto.clientEmail);
    if (emailExists) {
      throw TranslatedException.conflict('lead.duplicateEmail');
    }

    // Create the lead
    const lead = await this.leadRepository.create({
      leadName: dto.leadName.trim(),
      clientName: dto.clientName.trim(),
      clientPhone: dto.clientPhone.trim(),
      clientEmail: dto.clientEmail.toLowerCase().trim(),
      reference: dto.reference.trim(),
      attachmentUrl: dto.attachmentUrl?.trim(),
    });

    return this.mapToResponseDto(lead);
  }

  /**
   * Update an existing lead
   */
  async update(id: string, dto: UpdateLeadDto, lang: string): Promise<LeadResponseDto> {
    // Check if lead exists
    const existing = await this.leadRepository.findById(id);
    if (!existing) {
      throw TranslatedException.notFound('lead.notFound');
    }

    // Validate email if provided
    if (dto.clientEmail) {
      this.validateEmail(dto.clientEmail);

      // Check for duplicate email (excluding current lead)
      const emailExists = await this.leadRepository.existsByClientEmail(dto.clientEmail, id);
      if (emailExists) {
        throw TranslatedException.conflict('lead.duplicateEmail');
      }
    }

    // Validate phone if provided
    if (dto.clientPhone) {
      this.validatePhone(dto.clientPhone);
    }

    // Prepare update data (only include fields that are defined)
    const updateData: any = {};
    
    if (dto.leadName !== undefined) updateData.leadName = dto.leadName.trim();
    if (dto.clientName !== undefined) updateData.clientName = dto.clientName.trim();
    if (dto.clientPhone !== undefined) updateData.clientPhone = dto.clientPhone.trim();
    if (dto.clientEmail !== undefined) updateData.clientEmail = dto.clientEmail.toLowerCase().trim();
    if (dto.reference !== undefined) updateData.reference = dto.reference.trim();
    if (dto.attachmentUrl !== undefined) updateData.attachmentUrl = dto.attachmentUrl?.trim();

    // Update the lead
    const updated = await this.leadRepository.update(id, updateData);

    return this.mapToResponseDto(updated);
  }

  /**
   * Delete a lead
   */
  async remove(id: string, lang: string): Promise<{ message: string }> {
    // Check if lead exists
    const existing = await this.leadRepository.findById(id);
    if (!existing) {
      throw TranslatedException.notFound('lead.notFound');
    }

    // Delete the lead
    await this.leadRepository.delete(id);

    return {
      message: await this.i18n.translate('lead.deleteSuccess', { lang }),
    };
  }

  // ==================== Private Helper Methods ====================

  /**
   * Validate email format
   */
  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw TranslatedException.badRequest('lead.invalidEmail');
    }
  }

  /**
   * Validate phone format (E.164 format)
   */
  private validatePhone(phone: string): void {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      throw TranslatedException.badRequest('lead.invalidPhone');
    }
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponseDto(entity: any): LeadResponseDto {
    return {
      id: entity.id,
      leadName: entity.leadName,
      clientName: entity.clientName,
      clientPhone: entity.clientPhone,
      clientEmail: entity.clientEmail,
      reference: entity.reference,
      attachmentUrl: entity.attachmentUrl,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}


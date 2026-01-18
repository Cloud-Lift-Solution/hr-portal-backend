import { Injectable, NotFoundException } from '@nestjs/common';
import { SupportTicketRepository } from './repositories/support-ticket.repository';
import {
  CreateSupportTicketDto,
  UpdateTicketStatusDto,
  SupportTicketResponseDto,
} from './dto';

@Injectable()
export class SupportTicketService {
  constructor(private readonly repository: SupportTicketRepository) {}

  /**
   * Create a new support ticket
   */
  async create(
    employeeId: string,
    dto: CreateSupportTicketDto,
    language: string = 'en',
  ): Promise<SupportTicketResponseDto> {
    const ticket = await this.repository.create(
      employeeId,
      dto.title,
      dto.description,
      dto.categoryId,
      dto.priority,
    );

    return this.mapToResponse(ticket, language);
  }

  /**
   * Get all tickets for an employee
   */
  async findByEmployee(
    employeeId: string,
    language: string = 'en',
  ): Promise<SupportTicketResponseDto[]> {
    const tickets = await this.repository.findByEmployee(employeeId);
    return tickets.map((ticket) => this.mapToResponse(ticket, language));
  }

  /**
   * Get ticket by ID
   */
  async findById(id: string, language: string = 'en'): Promise<SupportTicketResponseDto> {
    const ticket = await this.repository.findById(id);

    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    return this.mapToResponse(ticket, language);
  }

  /**
   * Update ticket status
   */
  async updateStatus(
    id: string,
    dto: UpdateTicketStatusDto,
    language: string = 'en',
  ): Promise<SupportTicketResponseDto> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Support ticket not found');
    }

    const updated = await this.repository.updateStatus(id, dto.status);
    return this.mapToResponse(updated, language);
  }

  /**
   * Map ticket to response with localized category name
   */
  private mapToResponse(ticket: any, language: string): SupportTicketResponseDto {
    const translation = ticket.category.translations.find((t: any) => t.language === language);
    const fallbackTranslation = ticket.category.translations[0];

    return {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      categoryId: ticket.categoryId,
      categoryName: translation?.name || fallbackTranslation?.name || '',
      priority: ticket.priority,
      status: ticket.status,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    };
  }
}

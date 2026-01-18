import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ServerRepository } from './repositories/server.repository';
import { ProjectRepository } from '../project/repositories/project.repository';
import {
  CreateServerDto,
  UpdateServerDto,
  ServerQueryDto,
  ServerResponseDto,
  PaginatedServerResponseDto,
} from './dto';
import { TranslatedException } from '../../common/exceptions/business.exception';

@Injectable()
export class ServerService {
  constructor(
    private readonly serverRepository: ServerRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Find all servers with filters and pagination
   */
  async findAll(query: ServerQueryDto): Promise<PaginatedServerResponseDto> {
    const filters = {
      search: query.search,
      projectId: query.projectId,
      status: query.status,
      startMonth: query.startMonth,
      startYear: query.startYear,
      endMonth: query.endMonth,
      endYear: query.endYear,
      page: query.page || 1,
      limit: query.limit || 20,
    };

    const result = await this.serverRepository.findAllWithPagination(filters);

    return {
      data: result.data.map((server) => this.mapToResponseDto(server)),
      pagination: result.pagination,
    };
  }

  /**
   * Find a single server by ID
   */
  async findOne(id: string): Promise<ServerResponseDto> {
    const server = await this.serverRepository.findById(id);

    if (!server) {
      throw TranslatedException.notFound('server.notFound');
    }

    return this.mapToResponseDto(server);
  }

  /**
   * Create a new server
   */
  async create(dto: CreateServerDto, lang: string): Promise<ServerResponseDto> {
    // Validate project exists
    await this.validateProjectExists(dto.projectId);

    // Parse and validate dates
    const startDate = this.parseDate(dto.startDate, 'server.startDateInvalid');
    const endDate = this.parseDate(dto.endDate, 'server.endDateInvalid');

    // Validate date range
    this.validateDateRange(startDate, endDate);

    // Create the server
    const server = await this.serverRepository.create({
      projectId: dto.projectId,
      contractNo: dto.contractNo.trim(),
      price: dto.price,
      packageNum: dto.packageNum.trim(),
      startDate,
      endDate,
      attachmentUrl: dto.attachmentUrl?.trim(),
    });

    return this.mapToResponseDto(server);
  }

  /**
   * Update an existing server
   */
  async update(id: string, dto: UpdateServerDto, lang: string): Promise<ServerResponseDto> {
    // Check if server exists
    const existing = await this.serverRepository.findById(id);
    if (!existing) {
      throw TranslatedException.notFound('server.notFound');
    }

    // Validate project if being updated
    if (dto.projectId) {
      await this.validateProjectExists(dto.projectId);
    }

    // Determine effective dates
    const startDate = dto.startDate
      ? this.parseDate(dto.startDate, 'server.startDateInvalid')
      : existing.startDate;
    const endDate = dto.endDate
      ? this.parseDate(dto.endDate, 'server.endDateInvalid')
      : existing.endDate;

    // Validate date range with effective dates
    this.validateDateRange(startDate, endDate);

    // Prepare update data
    const updateData: any = {};

    if (dto.projectId !== undefined) updateData.projectId = dto.projectId;
    if (dto.contractNo !== undefined) updateData.contractNo = dto.contractNo.trim();
    if (dto.price !== undefined) updateData.price = dto.price;
    if (dto.packageNum !== undefined) updateData.packageNum = dto.packageNum.trim();
    if (dto.startDate !== undefined) updateData.startDate = startDate;
    if (dto.endDate !== undefined) updateData.endDate = endDate;
    if (dto.attachmentUrl !== undefined) updateData.attachmentUrl = dto.attachmentUrl?.trim();

    // Update the server
    const updated = await this.serverRepository.update(id, updateData);

    return this.mapToResponseDto(updated);
  }

  /**
   * Delete a server
   */
  async remove(id: string, lang: string): Promise<{ message: string }> {
    // Check if server exists
    const existing = await this.serverRepository.findById(id);
    if (!existing) {
      throw TranslatedException.notFound('server.notFound');
    }

    // Delete the server
    await this.serverRepository.delete(id);

    return {
      message: await this.i18n.translate('server.deleteSuccess', { lang }),
    };
  }

  // ==================== Private Helper Methods ====================

  /**
   * Validate that project exists
   */
  private async validateProjectExists(projectId: string): Promise<void> {
    const exists = await this.projectRepository.exists(projectId);
    if (!exists) {
      throw TranslatedException.notFound('server.projectNotFound');
    }
  }

  /**
   * Parse date string to Date object
   */
  private parseDate(dateString: string, errorKey: string): Date {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw TranslatedException.badRequest(errorKey);
    }
    return date;
  }

  /**
   * Validate that end date is after start date
   */
  private validateDateRange(startDate: Date, endDate: Date): void {
    if (startDate.getTime() >= endDate.getTime()) {
      throw TranslatedException.badRequest('server.endDateBeforeStart');
    }
  }

  /**
   * Calculate duration in days between two dates
   */
  private calculateDurationDays(startDate: Date, endDate: Date): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    const diffMs = endDate.getTime() - startDate.getTime();
    return Math.ceil(diffMs / msPerDay);
  }

  /**
   * Check if server is currently active
   */
  private isServerActive(startDate: Date, endDate: Date): boolean {
    const now = new Date();
    return now >= startDate && now <= endDate;
  }

  /**
   * Map entity to response DTO with calculated fields
   */
  private mapToResponseDto(entity: any): ServerResponseDto {
    const price = Number(entity.price);
    const durationDays = this.calculateDurationDays(entity.startDate, entity.endDate);
    const isActive = this.isServerActive(entity.startDate, entity.endDate);

    return {
      id: entity.id,
      projectId: entity.projectId,
      project: {
        id: entity.project.id,
        name: entity.project.name,
        type: entity.project.type,
      },
      contractNo: entity.contractNo,
      price: price,
      packageNum: entity.packageNum,
      startDate: entity.startDate,
      endDate: entity.endDate,
      durationDays: durationDays,
      isActive: isActive,
      attachmentUrl: entity.attachmentUrl,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}


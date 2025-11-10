import { Injectable, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { AllowanceRepository } from './repositories/allowance.repository';
import {
  CreateAllowanceDto,
  UpdateAllowanceDto,
  AllowanceResponseDto,
  AllowanceListResponseDto,
  DeleteAllowanceResponseDto,
  AllowanceQueryDto,
} from './dto';
import { TranslatedException } from '../../common/exceptions/business.exception';

@Injectable()
export class AllowanceService {
  private readonly logger = new Logger(AllowanceService.name);

  constructor(
    private readonly allowanceRepository: AllowanceRepository,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Create new allowance
   */
  async create(
    createAllowanceDto: CreateAllowanceDto,
    lang: string,
  ): Promise<AllowanceResponseDto> {
    this.logger.log(`Creating allowance: ${createAllowanceDto.name}`);

    // Check if allowance name already exists (case-insensitive)
    const existingAllowance = await this.allowanceRepository.findByName(
      createAllowanceDto.name,
    );

    if (existingAllowance) {
      throw TranslatedException.badRequest('allowance.nameExists');
    }

    // Create allowance
    const allowance = await this.allowanceRepository.create({
      name: createAllowanceDto.name,
      fees: createAllowanceDto.fees,
    });

    this.logger.log(`Allowance created successfully: ${allowance.id}`);

    return this.mapToResponseDto(allowance);
  }

  /**
   * Update allowance
   */
  async update(
    id: string,
    updateAllowanceDto: UpdateAllowanceDto,
    lang: string,
  ): Promise<AllowanceResponseDto> {
    this.logger.log(`Updating allowance: ${id}`);

    // Validate at least one field is provided
    if (!updateAllowanceDto.name && !updateAllowanceDto.fees) {
      throw TranslatedException.badRequest('allowance.atLeastOneField');
    }

    // Check if allowance exists
    const allowance = await this.allowanceRepository.findById(id);
    if (!allowance) {
      throw TranslatedException.notFound('allowance.notFound');
    }

    // If name is being updated, check uniqueness (excluding current record)
    if (updateAllowanceDto.name) {
      const existingAllowance =
        await this.allowanceRepository.findByNameExcludingId(
          updateAllowanceDto.name,
          id,
        );

      if (existingAllowance) {
        throw TranslatedException.badRequest('allowance.nameExists');
      }
    }

    // Update allowance
    const updated = await this.allowanceRepository.update(id, {
      name: updateAllowanceDto.name,
      fees: updateAllowanceDto.fees,
    });

    this.logger.log(`Allowance updated successfully: ${id}`);

    return this.mapToResponseDto(updated);
  }

  /**
   * Delete allowance
   */
  async delete(id: string, lang: string): Promise<DeleteAllowanceResponseDto> {
    this.logger.log(`Deleting allowance: ${id}`);

    // Check if allowance exists
    const allowance = await this.allowanceRepository.findById(id);
    if (!allowance) {
      throw TranslatedException.notFound('allowance.notFound');
    }

    // Delete allowance
    await this.allowanceRepository.delete(id);

    this.logger.log(`Allowance deleted successfully: ${id}`);

    return {
      message: await this.i18n.translate('allowance.deleteSuccess', { lang }),
    };
  }

  /**
   * Get single allowance by ID
   */
  async findOne(id: string): Promise<AllowanceResponseDto> {
    this.logger.log(`Finding allowance: ${id}`);

    const allowance = await this.allowanceRepository.findById(id);

    if (!allowance) {
      throw TranslatedException.notFound('allowance.notFound');
    }

    return this.mapToResponseDto(allowance);
  }

  /**
   * List all allowances with filters and pagination
   */
  async findAll(query: AllowanceQueryDto): Promise<AllowanceListResponseDto> {
    this.logger.log('Listing allowances with filters');

    const { data, total } = await this.allowanceRepository.findAll({
      search: query.search,
      sortBy: query.sortBy || 'name',
      sortOrder: query.sortOrder || 'asc',
      page: query.page || 1,
      limit: query.limit || 20,
    });

    return {
      data: data.map((allowance) => this.mapToResponseDto(allowance)),
      pagination: {
        page: query.page || 1,
        limit: query.limit || 20,
        total,
        totalPages: Math.ceil(total / (query.limit || 20)),
      },
    };
  }

  // ==================== HELPER METHODS ====================

  /**
   * Map database model to response DTO
   */
  private mapToResponseDto(allowance: any): AllowanceResponseDto {
    return {
      id: allowance.id,
      name: allowance.name,
      fees: parseFloat(allowance.fees.toString()),
      createdAt: allowance.createdAt,
      updatedAt: allowance.updatedAt,
    };
  }
}

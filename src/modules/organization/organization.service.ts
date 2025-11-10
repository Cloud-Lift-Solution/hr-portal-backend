import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { OrganizationRepository } from './repositories/organization.repository';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  OrganizationResponseDto,
  OrganizationListResponseDto,
  OrganizationQueryDto,
  DeleteOrganizationResponseDto,
  AdditionalNameResponseDto,
} from './dto';
import { TranslatedException } from '../../common/exceptions/business.exception';

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  constructor(
    private readonly repository: OrganizationRepository,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Create new organization
   */
  async create(
    createDto: CreateOrganizationDto,
    lang: string,
  ): Promise<OrganizationResponseDto> {
    this.logger.log(`Creating organization: ${createDto.name}`);

    // Validate name uniqueness
    await this.validateNameUniqueness(createDto.name, lang);

    // Prepare additional names with auto-assigned order
    const additionalNames = createDto.additionalNames
      ? createDto.additionalNames.map((name, index) => ({
          name: name.name,
          attachmentUrl: name.attachmentUrl || null,
          order: index + 1, // Auto-assign order: 1, 2, 3...
        }))
      : undefined;

    // Create organization
    const organization = await this.repository.create({
      name: createDto.name,
      additionalNames,
    });

    this.logger.log(`Organization created successfully: ${organization.id}`);

    return this.mapToResponseDto(organization);
  }

  /**
   * Update organization
   */
  async update(
    id: string,
    updateDto: UpdateOrganizationDto,
    lang: string,
  ): Promise<OrganizationResponseDto> {
    this.logger.log(`Updating organization: ${id}`);

    // Validate at least one field is provided
    if (!updateDto.name && !updateDto.additionalNames) {
      throw TranslatedException.badRequest('organization.atLeastOneField');
    }

    // Check if organization exists
    await this.ensureOrganizationExists(id);

    // Validate name uniqueness if name is being updated
    if (updateDto.name) {
      await this.validateNameUniqueness(updateDto.name, lang, id);
    }

    let organization: any;

    // If only name is being updated
    if (updateDto.name && !updateDto.additionalNames) {
      organization = await this.repository.update(id, {
        name: updateDto.name,
      });
    }
    // If only additional names are being updated
    else if (updateDto.additionalNames && !updateDto.name) {
      const additionalNames = updateDto.additionalNames.map((name, index) => ({
        name: name.name,
        attachmentUrl: name.attachmentUrl || null,
        order: index + 1,
      }));

      organization = await this.repository.replaceAdditionalNames(
        id,
        additionalNames,
      );
    }
    // If both are being updated
    else {
      // First update the name
      await this.repository.update(id, {
        name: updateDto.name,
      });

      // Then replace additional names
      const additionalNames = updateDto.additionalNames!.map((name, index) => ({
        name: name.name,
        attachmentUrl: name.attachmentUrl || null,
        order: index + 1,
      }));

      organization = await this.repository.replaceAdditionalNames(
        id,
        additionalNames,
      );
    }

    this.logger.log(`Organization updated successfully: ${id}`);

    return this.mapToResponseDto(organization);
  }

  /**
   * Delete organization
   */
  async delete(
    id: string,
    lang: string,
  ): Promise<DeleteOrganizationResponseDto> {
    this.logger.log(`Deleting organization: ${id}`);

    // Check if organization exists
    await this.ensureOrganizationExists(id);

    // Delete organization (cascade deletes additional names)
    await this.repository.delete(id);

    this.logger.log(`Organization deleted successfully: ${id}`);

    return {
      message: await this.i18n.translate('organization.deleteSuccess', {
        lang,
      }),
    };
  }

  /**
   * Get single organization by ID
   */
  async findOne(id: string): Promise<OrganizationResponseDto> {
    this.logger.log(`Finding organization: ${id}`);

    const organization = await this.repository.findById(id);

    if (!organization) {
      throw TranslatedException.notFound('organization.notFound');
    }

    return this.mapToResponseDto(organization);
  }

  /**
   * List all organizations with filters and pagination
   */
  async findAll(
    query: OrganizationQueryDto,
  ): Promise<OrganizationListResponseDto> {
    this.logger.log('Listing organizations with filters');

    const { data, total } = await this.repository.findAll({
      search: query.search,
      sortBy: query.sortBy || 'name',
      sortOrder: query.sortOrder || 'asc',
      page: query.page || 1,
      limit: query.limit || 20,
    });

    return {
      data: data.map((org) => this.mapToResponseDto(org)),
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
   * Ensure organization exists or throw error
   */
  private async ensureOrganizationExists(id: string): Promise<void> {
    const exists = await this.repository.exists(id);
    if (!exists) {
      throw TranslatedException.notFound('organization.notFound');
    }
  }

  /**
   * Validate organization name uniqueness
   */
  private async validateNameUniqueness(
    name: string,
    lang: string,
    excludeId?: string,
  ): Promise<void> {
    const exists = await this.repository.findByName(name, excludeId);

    if (exists) {
      throw new ConflictException(
        await this.i18n.translate('organization.nameExists', { lang }),
      );
    }
  }

  /**
   * Map database model to response DTO
   */
  private mapToResponseDto(organization: any): OrganizationResponseDto {
    return {
      id: organization.id,
      name: organization.name,
      additionalNames: organization.additionalNames
        ? organization.additionalNames.map((name: any) =>
            this.mapAdditionalNameToDto(name),
          )
        : [],
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    };
  }

  /**
   * Map additional name to DTO
   */
  private mapAdditionalNameToDto(name: any): AdditionalNameResponseDto {
    return {
      id: name.id,
      name: name.name,
      attachmentUrl: name.attachmentUrl,
      order: name.order,
      createdAt: name.createdAt,
      updatedAt: name.updatedAt,
    };
  }
}


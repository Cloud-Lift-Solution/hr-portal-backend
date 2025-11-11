import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PaymentMethod, Prisma } from '@prisma/client';
import { ProjectRepository } from './repositories/project.repository';
import { DepartmentRepository } from '../department/repositories/department.repository';
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectQueryDto,
  ProjectResponseDto,
  PaginatedProjectResponseDto,
} from './dto';
import { TranslatedException } from '../../common/exceptions/business.exception';

@Injectable()
export class ProjectService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly departmentRepository: DepartmentRepository,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Find all projects with filters and pagination
   */
  async findAll(query: ProjectQueryDto): Promise<PaginatedProjectResponseDto> {
    const filters = {
      search: query.search,
      type: query.type,
      month: query.month,
      year: query.year,
      departmentId: query.departmentId,
      page: query.page || 1,
      limit: query.limit || 20,
    };

    const result = await this.projectRepository.findAllWithPagination(filters);

    return {
      data: result.data.map((project) => this.mapToResponseDto(project)),
      pagination: result.pagination,
    };
  }

  /**
   * Find a single project by ID
   */
  async findOne(id: string): Promise<ProjectResponseDto> {
    const project = await this.projectRepository.findById(id);

    if (!project) {
      throw TranslatedException.notFound('project.notFound');
    }

    return this.mapToResponseDto(project);
  }

  /**
   * Create a new project
   */
  async create(dto: CreateProjectDto, lang: string): Promise<ProjectResponseDto> {
    // Validate department if provided
    if (dto.departmentId) {
      await this.validateDepartmentExists(dto.departmentId);
    }

    // Validate contract date range
    this.validateContractDate(dto.contractDate);

    // Validate payment percentages based on payment method
    this.validatePaymentPercentages(
      dto.paymentMethod,
      dto.paymentOnePercent,
      dto.paymentTwoPercent,
      dto.paymentThreePercent,
      dto.paymentFourPercent,
    );

    // Create the project
    const project = await this.projectRepository.create({
      type: dto.type,
      name: dto.name.trim(),
      departmentId: dto.departmentId,
      clientName: dto.clientName.trim(),
      clientPhone: dto.clientPhone.trim(),
      clientEmail: dto.clientEmail.toLowerCase().trim(),
      clientCivilId: dto.clientCivilId?.trim(),
      contractDate: new Date(dto.contractDate),
      contractNo: dto.contractNo.trim(),
      price: dto.price,
      paymentMethod: dto.paymentMethod,
      worksDay: dto.worksDay,
      maintaince: dto.maintaince,
      paymentOnePercent: dto.paymentOnePercent,
      paymentTwoPercent: dto.paymentTwoPercent,
      paymentThreePercent: dto.paymentThreePercent,
      paymentFourPercent: dto.paymentFourPercent,
      attachmentUrl: dto.attachmentUrl?.trim(),
    });

    return this.mapToResponseDto(project);
  }

  /**
   * Update an existing project
   */
  async update(id: string, dto: UpdateProjectDto, lang: string): Promise<ProjectResponseDto> {
    // Check if project exists
    const existing = await this.projectRepository.findById(id);
    if (!existing) {
      throw TranslatedException.notFound('project.notFound');
    }

    // Validate department if being updated
    if (dto.departmentId !== undefined && dto.departmentId !== null) {
      await this.validateDepartmentExists(dto.departmentId);
    }

    // Validate contract date if being updated
    if (dto.contractDate) {
      this.validateContractDate(dto.contractDate);
    }

    // Determine the effective payment method and percentages
    const effectivePaymentMethod = dto.paymentMethod ?? existing.paymentMethod;
    const effectivePercentOne =
      dto.paymentOnePercent !== undefined
        ? dto.paymentOnePercent
        : existing.paymentOnePercent
          ? Number(existing.paymentOnePercent)
          : undefined;
    const effectivePercentTwo =
      dto.paymentTwoPercent !== undefined
        ? dto.paymentTwoPercent
        : existing.paymentTwoPercent
          ? Number(existing.paymentTwoPercent)
          : undefined;
    const effectivePercentThree =
      dto.paymentThreePercent !== undefined
        ? dto.paymentThreePercent
        : existing.paymentThreePercent
          ? Number(existing.paymentThreePercent)
          : undefined;
    const effectivePercentFour =
      dto.paymentFourPercent !== undefined
        ? dto.paymentFourPercent
        : existing.paymentFourPercent
          ? Number(existing.paymentFourPercent)
          : undefined;

    // Validate payment percentages with effective values
    this.validatePaymentPercentages(
      effectivePaymentMethod,
      effectivePercentOne,
      effectivePercentTwo,
      effectivePercentThree,
      effectivePercentFour,
    );

    // Prepare update data
    const updateData: any = {};

    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.name !== undefined) updateData.name = dto.name.trim();
    if (dto.departmentId !== undefined) updateData.departmentId = dto.departmentId;
    if (dto.clientName !== undefined) updateData.clientName = dto.clientName.trim();
    if (dto.clientPhone !== undefined) updateData.clientPhone = dto.clientPhone.trim();
    if (dto.clientEmail !== undefined) updateData.clientEmail = dto.clientEmail.toLowerCase().trim();
    if (dto.clientCivilId !== undefined) updateData.clientCivilId = dto.clientCivilId?.trim();
    if (dto.contractDate !== undefined) updateData.contractDate = new Date(dto.contractDate);
    if (dto.contractNo !== undefined) updateData.contractNo = dto.contractNo.trim();
    if (dto.price !== undefined) updateData.price = dto.price;
    if (dto.paymentMethod !== undefined) updateData.paymentMethod = dto.paymentMethod;
    if (dto.worksDay !== undefined) updateData.worksDay = dto.worksDay;
    if (dto.maintaince !== undefined) updateData.maintaince = dto.maintaince;
    if (dto.paymentOnePercent !== undefined) updateData.paymentOnePercent = dto.paymentOnePercent;
    if (dto.paymentTwoPercent !== undefined) updateData.paymentTwoPercent = dto.paymentTwoPercent;
    if (dto.paymentThreePercent !== undefined) updateData.paymentThreePercent = dto.paymentThreePercent;
    if (dto.paymentFourPercent !== undefined) updateData.paymentFourPercent = dto.paymentFourPercent;
    if (dto.attachmentUrl !== undefined) updateData.attachmentUrl = dto.attachmentUrl?.trim();

    // Update the project
    const updated = await this.projectRepository.update(id, updateData);

    return this.mapToResponseDto(updated);
  }

  /**
   * Delete a project
   */
  async remove(id: string, lang: string): Promise<{ message: string }> {
    // Check if project exists
    const existing = await this.projectRepository.findById(id);
    if (!existing) {
      throw TranslatedException.notFound('project.notFound');
    }

    // Delete the project
    await this.projectRepository.delete(id);

    return {
      message: await this.i18n.translate('project.deleteSuccess', { lang }),
    };
  }

  // ==================== Private Helper Methods ====================

  /**
   * Validate that department exists
   */
  private async validateDepartmentExists(departmentId: string): Promise<void> {
    const exists = await this.departmentRepository.exists(departmentId);
    if (!exists) {
      throw TranslatedException.notFound('project.departmentNotFound');
    }
  }

  /**
   * Validate contract date is within acceptable range
   */
  private validateContractDate(dateString: string): void {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw TranslatedException.badRequest('project.contractDateInvalid');
    }

    const now = new Date();
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(now.getFullYear() - 10);

    const fiveYearsFromNow = new Date();
    fiveYearsFromNow.setFullYear(now.getFullYear() + 5);

    if (date < tenYearsAgo || date > fiveYearsFromNow) {
      throw TranslatedException.badRequest('project.contractDateRange');
    }
  }

  /**
   * Validate payment percentages based on payment method
   */
  private validatePaymentPercentages(
    paymentMethod: PaymentMethod,
    percentOne?: number | null,
    percentTwo?: number | null,
    percentThree?: number | null,
    percentFour?: number | null,
  ): void {
    switch (paymentMethod) {
      case PaymentMethod.FULL_PAYMENT:
        // FULL_PAYMENT should not have any percentages
        if (percentOne || percentTwo || percentThree || percentFour) {
          throw TranslatedException.badRequest('project.paymentPercentNotAllowed');
        }
        break;

      case PaymentMethod.TWO_PAYMENT:
        // TWO_PAYMENT requires exactly two percentages
        if (!percentOne || !percentTwo) {
          throw TranslatedException.badRequest('project.twoPaymentRequired');
        }
        if (percentThree || percentFour) {
          throw TranslatedException.badRequest('project.twoPaymentRequired');
        }
        this.validatePercentagesSum([percentOne, percentTwo], 'project.paymentPercentSum');
        break;

      case PaymentMethod.THREE_PAYMENT:
        // THREE_PAYMENT requires exactly three percentages
        if (!percentOne || !percentTwo || !percentThree) {
          throw TranslatedException.badRequest('project.threePaymentRequired');
        }
        if (percentFour) {
          throw TranslatedException.badRequest('project.threePaymentRequired');
        }
        this.validatePercentagesSum([percentOne, percentTwo, percentThree], 'project.paymentPercentSum');
        break;

      case PaymentMethod.FOUR_PAYMENT:
        // FOUR_PAYMENT requires all four percentages
        if (!percentOne || !percentTwo || !percentThree || !percentFour) {
          throw TranslatedException.badRequest('project.fourPaymentRequired');
        }
        this.validatePercentagesSum(
          [percentOne, percentTwo, percentThree, percentFour],
          'project.paymentPercentSum',
        );
        break;
    }
  }

  /**
   * Validate that percentages sum to 100% (with tolerance for rounding)
   */
  private validatePercentagesSum(percentages: number[], errorKey: string): void {
    const sum = percentages.reduce((acc, val) => acc + val, 0);
    const tolerance = 0.01; // Allow 0.01% tolerance for rounding errors

    if (Math.abs(sum - 100.0) > tolerance) {
      throw TranslatedException.badRequest(errorKey);
    }
  }

  /**
   * Calculate payment amount from percentage and price
   */
  private calculatePaymentAmount(price: number, percentage?: number | null): number | null {
    if (!percentage) return null;
    return Math.round((price * percentage) / 100 * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Map entity to response DTO with calculated amounts
   */
  private mapToResponseDto(entity: any): ProjectResponseDto {
    const price = Number(entity.price);
    const percentOne = entity.paymentOnePercent ? Number(entity.paymentOnePercent) : null;
    const percentTwo = entity.paymentTwoPercent ? Number(entity.paymentTwoPercent) : null;
    const percentThree = entity.paymentThreePercent ? Number(entity.paymentThreePercent) : null;
    const percentFour = entity.paymentFourPercent ? Number(entity.paymentFourPercent) : null;

    return {
      id: entity.id,
      type: entity.type,
      name: entity.name,
      department: entity.department
        ? {
            id: entity.department.id,
            name: entity.department.name,
          }
        : null,
      clientName: entity.clientName,
      clientPhone: entity.clientPhone,
      clientEmail: entity.clientEmail,
      clientCivilId: entity.clientCivilId,
      contractDate: entity.contractDate,
      contractNo: entity.contractNo,
      price: price,
      paymentMethod: entity.paymentMethod,
      worksDay: entity.worksDay,
      maintaince: entity.maintaince,
      paymentOnePercent: percentOne,
      paymentOneAmount: this.calculatePaymentAmount(price, percentOne),
      paymentTwoPercent: percentTwo,
      paymentTwoAmount: this.calculatePaymentAmount(price, percentTwo),
      paymentThreePercent: percentThree,
      paymentThreeAmount: this.calculatePaymentAmount(price, percentThree),
      paymentFourPercent: percentFour,
      paymentFourAmount: this.calculatePaymentAmount(price, percentFour),
      attachmentUrl: entity.attachmentUrl,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}


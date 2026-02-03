import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { DepartmentRepository } from './repositories/department.repository';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  DepartmentResponseDto,
} from './dto';
import { TranslatedException } from '../../common/exceptions/business.exception';
import {
  PaginatedResult,
  PaginationUtil,
} from '../../common/utils/pagination.util';

@Injectable()
export class DepartmentService {
  private readonly logger = new Logger(DepartmentService.name);

  constructor(
    private readonly departmentRepository: DepartmentRepository,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Get all departments with optional search and pagination
   */
  async findAll(
    search?: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<DepartmentResponseDto>> {
    // Normalize pagination parameters
    const normalizedPage = PaginationUtil.normalizePage(page);
    const normalizedLimit = PaginationUtil.normalizeLimit(limit);

    // Calculate skip
    const skip = PaginationUtil.getSkip(normalizedPage, normalizedLimit);

    // Get departments and total count
    const [departments, total] = await Promise.all([
      this.departmentRepository.findAll(search, skip, normalizedLimit),
      this.departmentRepository.count(search),
    ]);

    // Return paginated result
    return PaginationUtil.createPaginatedResult(
      departments as DepartmentResponseDto[],
      normalizedPage,
      normalizedLimit,
      total,
    );
  }

  /**
   * Get single department by ID
   */
  async findOne(id: string): Promise<DepartmentResponseDto> {
    const department = await this.departmentRepository.findById(id);

    if (!department) {
      throw TranslatedException.notFound('department.notFound');
    }

    return department as DepartmentResponseDto;
  }

  /**
   * Create new department
   */
  async create(
    createDepartmentDto: CreateDepartmentDto,
    lang: string,
  ): Promise<DepartmentResponseDto> {
    // Check if name already exists
    await this.validateNameUniqueness(createDepartmentDto.name, lang);

    // Create department
    const department = await this.departmentRepository.create(
      createDepartmentDto.name,
    );

    return department as DepartmentResponseDto;
  }

  /**
   * Update existing department
   */
  async update(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
    lang: string,
  ): Promise<DepartmentResponseDto> {
    // Check if department exists
    await this.ensureDepartmentExists(id);

    // Check if name already exists (if name is being updated)
    if (updateDepartmentDto.name) {
      await this.validateNameUniqueness(updateDepartmentDto.name, lang, id);
    }

    // Update department
    const updatedDepartment = await this.departmentRepository.update(
      id,
      updateDepartmentDto.name!,
    );

    return updatedDepartment as DepartmentResponseDto;
  }

  /**
   * Delete department
   */
  async remove(id: string, lang: string): Promise<{ message: string }> {
    // Check if department exists
    await this.ensureDepartmentExists(id);

    // Delete department
    await this.departmentRepository.delete(id);

    return {
      message: await this.i18n.translate('department.deleteSuccess', { lang }),
    };
  }

  /**
   * Ensure department exists or throw error
   */
  private async ensureDepartmentExists(id: string): Promise<void> {
    const exists = await this.departmentRepository.exists(id);
    if (!exists) {
      throw TranslatedException.notFound('department.notFound');
    }
  }

  /**
   * Validate department name uniqueness
   */
  private async validateNameUniqueness(
    name: string,
    lang: string,
    excludeDepartmentId?: string,
  ): Promise<void> {
    const exists = await this.departmentRepository.nameExists(
      name,
      excludeDepartmentId,
    );

    if (exists) {
      throw new ConflictException(
        this.i18n.translate('department.nameExists', { lang }),
      );
    }
  }
}

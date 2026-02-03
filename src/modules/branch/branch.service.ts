import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { BranchRepository } from './repositories/branch.repository';
import {
  CreateBranchDto,
  UpdateBranchDto,
  BranchResponseDto,
  BranchDetailResponseDto,
} from './dto';
import { TranslatedException } from '../../common/exceptions/business.exception';
import {
  PaginatedResult,
  PaginationUtil,
} from '../../common/utils/pagination.util';

@Injectable()
export class BranchService {
  private readonly logger = new Logger(BranchService.name);

  constructor(
    private readonly branchRepository: BranchRepository,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Get all branches with localized name and pagination
   */
  async findAll(
    language: string = 'en',
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<BranchResponseDto>> {
    // Normalize pagination parameters
    const normalizedPage = PaginationUtil.normalizePage(page);
    const normalizedLimit = PaginationUtil.normalizeLimit(limit);

    // Calculate skip
    const skip = PaginationUtil.getSkip(normalizedPage, normalizedLimit);

    // Get branches and total count
    const [branches, total] = await Promise.all([
      this.branchRepository.findAll(skip, normalizedLimit),
      this.branchRepository.count(),
    ]);

    // Map to response DTOs
    const data = branches.map((branch) => this.mapToResponse(branch, language));

    // Return paginated result
    return PaginationUtil.createPaginatedResult(
      data,
      normalizedPage,
      normalizedLimit,
      total,
    );
  }

  /**
   * Get all branches with all translations
   */
  async findAllDetailed(): Promise<BranchDetailResponseDto[]> {
    const branches = await this.branchRepository.findAll();
    return branches.map((branch) => this.mapToDetailResponse(branch));
  }

  /**
   * Get branches by department ID with pagination
   */
  async findByDepartmentId(
    departmentId: string,
    language: string = 'en',
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<BranchResponseDto>> {
    // Normalize pagination parameters
    const normalizedPage = PaginationUtil.normalizePage(page);
    const normalizedLimit = PaginationUtil.normalizeLimit(limit);

    // Calculate skip
    const skip = PaginationUtil.getSkip(normalizedPage, normalizedLimit);

    // Get branches and total count
    const [branches, total] = await Promise.all([
      this.branchRepository.findByDepartmentId(departmentId, skip, normalizedLimit),
      this.branchRepository.countByDepartmentId(departmentId),
    ]);

    // Map to response DTOs
    const data = branches.map((branch) => this.mapToResponse(branch, language));

    // Return paginated result
    return PaginationUtil.createPaginatedResult(
      data,
      normalizedPage,
      normalizedLimit,
      total,
    );
  }

  /**
   * Get single branch by ID with all details
   */
  async findOne(id: string): Promise<BranchDetailResponseDto> {
    const branch = await this.branchRepository.findById(id);

    if (!branch) {
      throw TranslatedException.notFound('branch.notFound');
    }

    return this.mapToDetailResponse(branch);
  }

  /**
   * Create new branch
   */
  async create(
    createBranchDto: CreateBranchDto,
    lang: string,
  ): Promise<BranchDetailResponseDto> {
    // Create branch with translations
    const branch = await this.branchRepository.create(
      createBranchDto.departmentId,
      createBranchDto.openAnyTime || false,
      createBranchDto.nameAr,
      createBranchDto.nameEn,
      createBranchDto.workShiftId,
    );

    return this.mapToDetailResponse(branch);
  }

  /**
   * Update existing branch
   */
  async update(
    id: string,
    updateBranchDto: UpdateBranchDto,
    lang: string,
  ): Promise<BranchDetailResponseDto> {
    // Check if branch exists
    await this.ensureBranchExists(id);

    // Update branch
    const updatedBranch = await this.branchRepository.update(id, {
      departmentId: updateBranchDto.departmentId,
      openAnyTime: updateBranchDto.openAnyTime,
      workShiftId: updateBranchDto.workShiftId,
      nameAr: updateBranchDto.nameAr,
      nameEn: updateBranchDto.nameEn,
    });

    return this.mapToDetailResponse(updatedBranch);
  }

  /**
   * Delete branch
   */
  async remove(id: string, lang: string): Promise<{ message: string }> {
    // Check if branch exists
    await this.ensureBranchExists(id);

    // Delete branch
    await this.branchRepository.delete(id);

    return {
      message: await this.i18n.translate('branch.deleteSuccess', { lang }),
    };
  }

  /**
   * Ensure branch exists or throw error
   */
  private async ensureBranchExists(id: string): Promise<void> {
    const exists = await this.branchRepository.exists(id);
    if (!exists) {
      throw TranslatedException.notFound('branch.notFound');
    }
  }

  /**
   * Map branch entity to response DTO with localized name
   */
  private mapToResponse(branch: any, language: string): BranchResponseDto {
    const translation = branch.translations.find(
      (t: any) => t.language.code === language,
    );

    return {
      id: branch.id,
      name: translation?.name || branch.translations[0]?.name || 'N/A',
      openAnyTime: branch.openAnyTime,
      departmentId: branch.departmentId,
      departmentName: branch.department?.name || 'N/A',
      workShiftId: branch.workShiftId || undefined,
      workShiftName: branch.workShift?.name || undefined,
      createdAt: branch.createdAt,
      updatedAt: branch.updatedAt,
    };
  }

  /**
   * Map branch entity to detailed response DTO with all translations
   */
  private mapToDetailResponse(branch: any): BranchDetailResponseDto {
    const enTranslation = branch.translations.find(
      (t: any) => t.language.code === 'en',
    );
    const arTranslation = branch.translations.find(
      (t: any) => t.language.code === 'ar',
    );

    return {
      id: branch.id,
      nameEn: enTranslation?.name || '',
      nameAr: arTranslation?.name || '',
      openAnyTime: branch.openAnyTime,
      departmentId: branch.departmentId,
      departmentName: branch.department?.name || 'N/A',
      workShiftId: branch.workShiftId || undefined,
      workShiftName: branch.workShift?.name || undefined,
      createdAt: branch.createdAt,
      updatedAt: branch.updatedAt,
    };
  }
}

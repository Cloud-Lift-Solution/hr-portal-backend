import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { CompanyPolicyRepository } from './repositories/company-policy.repository';
import {
  CreateCompanyPolicyDto,
  UpdateCompanyPolicyDto,
  CompanyPolicyResponseDto,
} from './dto';
import {
  PaginatedResult,
  PaginationUtil,
} from '../../common/utils/pagination.util';

@Injectable()
export class CompanyPolicyService {
  private readonly logger = new Logger(CompanyPolicyService.name);

  constructor(
    private readonly companyPolicyRepository: CompanyPolicyRepository,
  ) {}

  /**
   * Create a new company policy
   */
  async create(
    createDto: CreateCompanyPolicyDto,
  ): Promise<CompanyPolicyResponseDto> {
    try {
      const data: any = {
        title: createDto.title,
        description: createDto.description,
        company: {
          connect: { id: createDto.companyId },
        },
      };

      // Add optional fields
      if (createDto.fileUrl) {
        data.fileUrl = createDto.fileUrl;
      }
      if (createDto.branchId) {
        data.branch = {
          connect: { id: createDto.branchId },
        };
      }

      const policy = await this.companyPolicyRepository.create(data);

      return this.mapToResponseDto(policy);
    } catch (error) {
      this.logger.error('Failed to create company policy', error);
      throw error;
    }
  }

  /**
   * Get all company policies with pagination
   */
  async findAll(
    page?: number,
    limit?: number,
    companyId?: string,
    branchId?: string,
  ): Promise<PaginatedResult<CompanyPolicyResponseDto>> {
    const normalizedPage = PaginationUtil.normalizePage(page);
    const normalizedLimit = PaginationUtil.normalizeLimit(limit);
    const skip = PaginationUtil.getSkip(normalizedPage, normalizedLimit);

    let policies: any[];
    let total: number;

    if (companyId) {
      [policies, total] = await Promise.all([
        this.companyPolicyRepository.findByCompanyId(
          companyId,
          skip,
          normalizedLimit,
        ),
        this.companyPolicyRepository.countByCompanyId(companyId),
      ]);
    } else if (branchId) {
      [policies, total] = await Promise.all([
        this.companyPolicyRepository.findByBranchId(
          branchId,
          skip,
          normalizedLimit,
        ),
        this.companyPolicyRepository.countByBranchId(branchId),
      ]);
    } else {
      [policies, total] = await Promise.all([
        this.companyPolicyRepository.findAll(skip, normalizedLimit),
        this.companyPolicyRepository.count(),
      ]);
    }

    const policyDtos = policies.map((policy) =>
      this.mapToResponseDto(policy),
    );

    return PaginationUtil.createPaginatedResult(
      policyDtos,
      normalizedPage,
      normalizedLimit,
      total,
    );
  }

  /**
   * Get a single company policy by ID
   */
  async findOne(id: string): Promise<CompanyPolicyResponseDto> {
    const policy = await this.companyPolicyRepository.findById(id);

    if (!policy) {
      throw new NotFoundException(`Company policy with ID ${id} not found`);
    }

    return this.mapToResponseDto(policy);
  }

  /**
   * Update a company policy
   */
  async update(
    id: string,
    updateDto: UpdateCompanyPolicyDto,
  ): Promise<CompanyPolicyResponseDto> {
    // Verify policy exists
    await this.findOne(id);

    try {
      const data: any = {};

      if (updateDto.title !== undefined) {
        data.title = updateDto.title;
      }
      if (updateDto.description !== undefined) {
        data.description = updateDto.description;
      }
      if (updateDto.fileUrl !== undefined) {
        data.fileUrl = updateDto.fileUrl;
      }
      if (updateDto.companyId !== undefined) {
        data.company = {
          connect: { id: updateDto.companyId },
        };
      }
      if (updateDto.branchId !== undefined) {
        data.branch = updateDto.branchId
          ? { connect: { id: updateDto.branchId } }
          : { disconnect: true };
      }

      const policy = await this.companyPolicyRepository.update(id, data);

      return this.mapToResponseDto(policy);
    } catch (error) {
      this.logger.error(`Failed to update company policy with ID ${id}`, error);
      throw error;
    }
  }

  /**
   * Delete a company policy
   */
  async remove(id: string): Promise<void> {
    // Verify policy exists
    await this.findOne(id);

    try {
      await this.companyPolicyRepository.delete(id);
    } catch (error) {
      this.logger.error(`Failed to delete company policy with ID ${id}`, error);
      throw error;
    }
  }

  /**
   * Map CompanyPolicy entity to response DTO
   */
  private mapToResponseDto(policy: any): CompanyPolicyResponseDto {
    return {
      id: policy.id,
      title: policy.title,
      description: policy.description,
      fileUrl: policy.fileUrl,
      companyId: policy.companyId,
      branchId: policy.branchId,
      createdAt: policy.createdAt.toISOString(),
      updatedAt: policy.updatedAt.toISOString(),
    };
  }
}

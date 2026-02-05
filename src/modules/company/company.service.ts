import {
  Injectable,
  NotFoundException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { CompanyRepository } from './repositories/company.repository';
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  CompanyResponseDto,
} from './dto';
import {
  PaginatedResult,
  PaginationUtil,
} from '../../common/utils/pagination.util';

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  constructor(private readonly companyRepository: CompanyRepository) {}

  /**
   * Create a new company
   */
  async create(createDto: CreateCompanyDto): Promise<CompanyResponseDto> {
    try {
      const data: any = {
        legalName: createDto.legalName,
        civilId: createDto.civilId,
        authorisedSignatory: createDto.authorisedSignatory,
        owner: createDto.owner,
        address: createDto.address,
        description: createDto.description,
        licenseNumber: createDto.licenseNumber,
        commercialRegistration: createDto.commercialRegistration,
        legalOffice: createDto.legalOffice,
      };

      // Add optional fields if provided
      if (createDto.establishmentDate) {
        data.establishmentDate = new Date(createDto.establishmentDate);
      }
      if (createDto.phone) {
        data.phone = createDto.phone;
      }
      if (createDto.faxNumber) {
        data.faxNumber = createDto.faxNumber;
      }

      const company = await this.companyRepository.create(data);

      return this.mapToResponseDto(company);
    } catch (error) {
      this.logger.error('Failed to create company', error);
      throw error;
    }
  }

  /**
   * Get all companies with pagination
   */
  async findAll(
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<CompanyResponseDto>> {
    const normalizedPage = PaginationUtil.normalizePage(page);
    const normalizedLimit = PaginationUtil.normalizeLimit(limit);
    const skip = PaginationUtil.getSkip(normalizedPage, normalizedLimit);

    const [companies, total] = await Promise.all([
      this.companyRepository.findAll(skip, normalizedLimit),
      this.companyRepository.count(),
    ]);

    const companyDtos = companies.map((company) =>
      this.mapToResponseDto(company),
    );

    return PaginationUtil.createPaginatedResult(
      companyDtos,
      normalizedPage,
      normalizedLimit,
      total,
    );
  }

  /**
   * Get a single company by ID
   */
  async findOne(id: string): Promise<CompanyResponseDto> {
    const company = await this.companyRepository.findById(id);

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return this.mapToResponseDto(company);
  }

  /**
   * Update a company
   */
  async update(
    id: string,
    updateDto: UpdateCompanyDto,
  ): Promise<CompanyResponseDto> {
    // Verify company exists
    await this.findOne(id);

    try {
      const data: any = {};

      // Add fields if provided
      if (updateDto.legalName !== undefined) {
        data.legalName = updateDto.legalName;
      }
      if (updateDto.civilId !== undefined) {
        data.civilId = updateDto.civilId;
      }
      if (updateDto.authorisedSignatory !== undefined) {
        data.authorisedSignatory = updateDto.authorisedSignatory;
      }
      if (updateDto.establishmentDate !== undefined) {
        data.establishmentDate = new Date(updateDto.establishmentDate);
      }
      if (updateDto.owner !== undefined) {
        data.owner = updateDto.owner;
      }
      if (updateDto.address !== undefined) {
        data.address = updateDto.address;
      }
      if (updateDto.description !== undefined) {
        data.description = updateDto.description;
      }
      if (updateDto.phone !== undefined) {
        data.phone = updateDto.phone;
      }
      if (updateDto.faxNumber !== undefined) {
        data.faxNumber = updateDto.faxNumber;
      }
      if (updateDto.licenseNumber !== undefined) {
        data.licenseNumber = updateDto.licenseNumber;
      }
      if (updateDto.commercialRegistration !== undefined) {
        data.commercialRegistration = updateDto.commercialRegistration;
      }
      if (updateDto.legalOffice !== undefined) {
        data.legalOffice = updateDto.legalOffice;
      }

      const company = await this.companyRepository.update(id, data);

      return this.mapToResponseDto(company);
    } catch (error) {
      this.logger.error(`Failed to update company with ID ${id}`, error);
      throw error;
    }
  }

  /**
   * Delete a company
   */
  async remove(id: string): Promise<void> {
    // Verify company exists
    await this.findOne(id);

    try {
      await this.companyRepository.delete(id);
    } catch (error) {
      this.logger.error(`Failed to delete company with ID ${id}`, error);
      throw error;
    }
  }

  /**
   * Map Company entity to response DTO
   */
  private mapToResponseDto(company: any): CompanyResponseDto {
    return {
      id: company.id,
      legalName: company.legalName,
      civilId: company.civilId,
      authorisedSignatory: company.authorisedSignatory,
      establishmentDate: company.establishmentDate?.toISOString() || null,
      owner: company.owner,
      address: company.address,
      description: company.description,
      phone: company.phone,
      faxNumber: company.faxNumber,
      licenseNumber: company.licenseNumber,
      commercialRegistration: company.commercialRegistration,
      legalOffice: company.legalOffice,
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString(),
    };
  }
}

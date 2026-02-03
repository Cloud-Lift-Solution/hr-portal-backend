import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { EmploymentType } from '@prisma/client';
import { EmployeeRepository } from './repositories/employee.repository';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  EmployeeResponseDto,
} from './dto';
import { TranslatedException } from '../../common/exceptions/business.exception';
import {
  PaginatedResult,
  PaginationUtil,
} from '../../common/utils/pagination.util';

@Injectable()
export class EmployeeService {
  private readonly logger = new Logger(EmployeeService.name);

  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Get all employees with optional filters and pagination
   */
  async findAll(
    filters?: {
      search?: string;
      departmentId?: string;
      type?: EmploymentType;
    },
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<EmployeeResponseDto>> {
    // Normalize pagination parameters
    const normalizedPage = PaginationUtil.normalizePage(page);
    const normalizedLimit = PaginationUtil.normalizeLimit(limit);

    // Calculate skip
    const skip = PaginationUtil.getSkip(normalizedPage, normalizedLimit);

    // Get employees and total count
    const [employees, total] = await Promise.all([
      this.employeeRepository.findAll(filters, skip, normalizedLimit),
      this.employeeRepository.count(filters),
    ]);

    // Map to response DTOs
    const data = employees.map((employee) => this.mapToResponseDto(employee));

    // Return paginated result
    return PaginationUtil.createPaginatedResult(
      data,
      normalizedPage,
      normalizedLimit,
      total,
    );
  }

  /**
   * Get single employee by ID
   */
  async findOne(id: string): Promise<EmployeeResponseDto> {
    const employee = await this.employeeRepository.findById(id);

    if (!employee) {
      throw TranslatedException.notFound('employee.notFound');
    }

    return this.mapToResponseDto(employee);
  }

  /**
   * Create new employee
   */
  async create(
    createEmployeeDto: CreateEmployeeDto,
    lang: string,
  ): Promise<EmployeeResponseDto> {
    // Validate company email uniqueness if provided
    if (createEmployeeDto.companyEmail) {
      await this.validateCompanyEmailUniqueness(
        createEmployeeDto.companyEmail,
        lang,
      );
    }

    // Create employee
    const employee = await this.employeeRepository.create({
      name: createEmployeeDto.name,
      civilId: createEmployeeDto.civilId,
      civilIdExpiryDate: createEmployeeDto.civilIdExpiryDate
        ? new Date(createEmployeeDto.civilIdExpiryDate)
        : undefined,
      passportNo: createEmployeeDto.passportNo,
      passportExpiryDate: createEmployeeDto.passportExpiryDate
        ? new Date(createEmployeeDto.passportExpiryDate)
        : undefined,
      nationality: createEmployeeDto.nationality,
      jobTitle: createEmployeeDto.jobTitle,
      startDate: createEmployeeDto.startDate
        ? new Date(createEmployeeDto.startDate)
        : undefined,
      type: createEmployeeDto.type,
      salary: createEmployeeDto.salary,
      iban: createEmployeeDto.iban,
      personalEmail: createEmployeeDto.personalEmail,
      companyEmail: createEmployeeDto.companyEmail,
      departmentId: createEmployeeDto.departmentId,
      assetIds: createEmployeeDto.assetIds,
      attachments: createEmployeeDto.attachments,
    });

    return this.mapToResponseDto(employee);
  }

  /**
   * Update existing employee
   */
  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
    lang: string,
  ): Promise<EmployeeResponseDto> {
    // Check if employee exists
    await this.ensureEmployeeExists(id);

    // Validate company email uniqueness if being updated
    if (updateEmployeeDto.companyEmail) {
      await this.validateCompanyEmailUniqueness(
        updateEmployeeDto.companyEmail,
        lang,
        id,
      );
    }

    // Prepare update data with field transformations
    const updateData = this.prepareUpdateData(updateEmployeeDto);

    // Update employee
    const updatedEmployee = await this.employeeRepository.update(
      id,
      updateData,
    );

    return this.mapToResponseDto(updatedEmployee);
  }

  /**
   * Soft delete employee
   */
  async remove(id: string, lang: string): Promise<{ message: string }> {
    // Check if employee exists
    await this.ensureEmployeeExists(id);

    // Soft delete employee
    await this.employeeRepository.delete(id);

    return {
      message: await this.i18n.translate('employee.deleteSuccess', { lang }),
    };
  }

  /**
   * Restore soft-deleted employee
   */
  async restore(id: string): Promise<EmployeeResponseDto> {
    // Restore the employee
    const restoredEmployee = await this.employeeRepository.restore(id);

    if (!restoredEmployee) {
      throw TranslatedException.notFound('employee.notFound');
    }

    return this.mapToResponseDto(restoredEmployee);
  }

  /**
   * Prepare update data from DTO with field transformations
   */
  private prepareUpdateData(updateEmployeeDto: UpdateEmployeeDto): any {
    const updateData: any = {};

    // Define fields that need date transformation
    const dateFields = ['civilIdExpiryDate', 'passportExpiryDate', 'startDate'];

    // Iterate over DTO properties
    Object.entries(updateEmployeeDto).forEach(([key, value]) => {
      if (value === undefined) return;

      // Transform date fields
      if (dateFields.includes(key)) {
        updateData[key] = value ? new Date(value as string) : null;
      } else {
        // Copy value as-is for other fields
        updateData[key] = value;
      }
    });

    return updateData;
  }

  /**
   * Ensure employee exists or throw error
   */
  private async ensureEmployeeExists(id: string): Promise<void> {
    const exists = await this.employeeRepository.exists(id);
    if (!exists) {
      throw TranslatedException.notFound('employee.notFound');
    }
  }

  /**
   * Validate company email uniqueness
   */
  private async validateCompanyEmailUniqueness(
    companyEmail: string,
    lang: string,
    excludeEmployeeId?: string,
  ): Promise<void> {
    const exists = await this.employeeRepository.companyEmailExists(
      companyEmail,
      excludeEmployeeId,
    );

    if (exists) {
      throw new ConflictException(
        this.i18n.translate('employee.companyEmailExists', { lang }),
      );
    }
  }

  /**
   * Map employee to response DTO
   */
  private mapToResponseDto(employee: any): EmployeeResponseDto {
    return {
      id: employee.id,
      name: employee.name,
      civilId: employee.civilId,
      civilIdExpiryDate: employee.civilIdExpiryDate,
      passportNo: employee.passportNo,
      passportExpiryDate: employee.passportExpiryDate,
      nationality: employee.nationality,
      jobTitle: employee.jobTitle,
      startDate: employee.startDate,
      type: employee.type,
      status: employee.status,
      salary: employee.salary ? parseFloat(employee.salary.toString()) : null,
      iban: employee.iban,
      personalEmail: employee.personalEmail,
      companyEmail: employee.companyEmail,
      department: employee.department,
      assets:
        employee.assets?.map((ea: any) => ({
          id: ea.asset.id,
          name: ea.asset.name,
          serialNumber: ea.asset.serialNumber,
          assignedAt: ea.assignedAt,
        })) || [],
      attachments: employee.attachments || [],
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
    };
  }
}

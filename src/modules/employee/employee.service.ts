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

@Injectable()
export class EmployeeService {
  private readonly logger = new Logger(EmployeeService.name);

  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Get all employees with optional filters
   */
  async findAll(filters?: {
    search?: string;
    departmentId?: string;
    type?: EmploymentType;
  }): Promise<EmployeeResponseDto[]> {
    const employees = await this.employeeRepository.findAll(filters);
    return employees.map((employee) => this.mapToResponseDto(employee));
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

    // Prepare update data
    const updateData: any = {};

    if (updateEmployeeDto.name !== undefined)
      updateData.name = updateEmployeeDto.name;
    if (updateEmployeeDto.civilId !== undefined)
      updateData.civilId = updateEmployeeDto.civilId;
    if (updateEmployeeDto.civilIdExpiryDate !== undefined) {
      updateData.civilIdExpiryDate = updateEmployeeDto.civilIdExpiryDate
        ? new Date(updateEmployeeDto.civilIdExpiryDate)
        : null;
    }
    if (updateEmployeeDto.passportNo !== undefined)
      updateData.passportNo = updateEmployeeDto.passportNo;
    if (updateEmployeeDto.passportExpiryDate !== undefined) {
      updateData.passportExpiryDate = updateEmployeeDto.passportExpiryDate
        ? new Date(updateEmployeeDto.passportExpiryDate)
        : null;
    }
    if (updateEmployeeDto.nationality !== undefined)
      updateData.nationality = updateEmployeeDto.nationality;
    if (updateEmployeeDto.jobTitle !== undefined)
      updateData.jobTitle = updateEmployeeDto.jobTitle;
    if (updateEmployeeDto.startDate !== undefined) {
      updateData.startDate = updateEmployeeDto.startDate
        ? new Date(updateEmployeeDto.startDate)
        : null;
    }
    if (updateEmployeeDto.type !== undefined)
      updateData.type = updateEmployeeDto.type;
    if (updateEmployeeDto.salary !== undefined)
      updateData.salary = updateEmployeeDto.salary;
    if (updateEmployeeDto.iban !== undefined)
      updateData.iban = updateEmployeeDto.iban;
    if (updateEmployeeDto.personalEmail !== undefined)
      updateData.personalEmail = updateEmployeeDto.personalEmail;
    if (updateEmployeeDto.companyEmail !== undefined)
      updateData.companyEmail = updateEmployeeDto.companyEmail;
    if (updateEmployeeDto.departmentId !== undefined)
      updateData.departmentId = updateEmployeeDto.departmentId;

    // Handle assets replacement if provided
    if (updateEmployeeDto.assetIds !== undefined) {
      updateData.assetIds = updateEmployeeDto.assetIds;
    }

    // Handle attachments replacement if provided
    if (updateEmployeeDto.attachments !== undefined) {
      updateData.attachments = updateEmployeeDto.attachments;
    }

    // Update employee
    const updatedEmployee = await this.employeeRepository.update(
      id,
      updateData,
    );

    return this.mapToResponseDto(updatedEmployee);
  }

  /**
   * Delete employee
   */
  async remove(id: string, lang: string): Promise<{ message: string }> {
    // Check if employee exists
    await this.ensureEmployeeExists(id);

    // Delete employee
    await this.employeeRepository.delete(id);

    return {
      message: await this.i18n.translate('employee.deleteSuccess', { lang }),
    };
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
        await this.i18n.translate('employee.companyEmailExists', { lang }),
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

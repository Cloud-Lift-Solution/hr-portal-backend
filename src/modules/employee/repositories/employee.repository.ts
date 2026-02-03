import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { EmploymentType, EmployeeStatus, Prisma } from '@prisma/client';

@Injectable()
export class EmployeeRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Base include for employee relations
   */
  private readonly includeRelations = {
    department: {
      select: {
        id: true,
        name: true,
      },
    },
    assets: {
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            serialNumber: true,
          },
        },
      },
    },
    attachments: true,
  };

  /**
   * Base where condition to filter only active employees
   */
  private readonly activeCondition = {
    status: EmployeeStatus.ACTIVE,
  };

  /**
   * Find all employees with optional filters and pagination (only active employees)
   */
  async findAll(
    filters?: {
      search?: string;
      departmentId?: string;
      type?: EmploymentType;
    },
    skip?: number,
    take?: number,
  ) {
    const where: Prisma.EmployeeWhereInput = {
      ...this.activeCondition,
    };

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { companyEmail: { contains: filters.search } },
        { civilId: { contains: filters.search } },
      ];
    }

    if (filters?.departmentId) {
      where.branchId = filters.departmentId;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    return this.prisma.employee.findMany({
      where,
      include: this.includeRelations,
      orderBy: {
        name: 'asc',
      },
      skip,
      take,
    });
  }

  /**
   * Count employees with optional filters (only active employees)
   */
  async count(filters?: {
    search?: string;
    departmentId?: string;
    type?: EmploymentType;
  }): Promise<number> {
    const where: Prisma.EmployeeWhereInput = {
      ...this.activeCondition,
    };

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { companyEmail: { contains: filters.search } },
        { civilId: { contains: filters.search } },
      ];
    }

    if (filters?.departmentId) {
      where.branchId = filters.departmentId;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    return this.prisma.employee.count({ where });
  }

  /**
   * Find employee by ID (only active employees)
   */
  async findById(id: string) {
    return this.prisma.employee.findFirst({
      where: {
        id,
        ...this.activeCondition,
      },
      include: this.includeRelations,
    });
  }

  /**
   * Find employee by company email (only active employees)
   */
  async findByCompanyEmail(companyEmail: string) {
    return this.prisma.employee.findFirst({
      where: {
        companyEmail,
        ...this.activeCondition,
      },
    });
  }

  /**
   * Create employee
   */
  async create(data: {
    name: string;
    civilId?: string;
    civilIdExpiryDate?: Date;
    passportNo?: string;
    passportExpiryDate?: Date;
    nationality?: string;
    jobTitle?: string;
    startDate?: Date;
    type: EmploymentType;
    salary?: number;
    iban?: string;
    personalEmail?: string;
    companyEmail?: string;
    departmentId?: string;
    assetIds?: string[];
    attachments?: Array<{
      url: string;
      fileName?: string;
      fileSize?: number;
      mimeType?: string;
    }>;
  }) {
    return this.prisma.employee.create({
      data: {
        name: data.name,
        civilId: data.civilId,
        civilIdExpiryDate: data.civilIdExpiryDate,
        passportNo: data.passportNo,
        passportExpiryDate: data.passportExpiryDate,
        nationality: data.nationality,
        jobTitle: data.jobTitle,
        startDate: data.startDate,
        type: data.type,
        salary: data.salary,
        iban: data.iban,
        personalEmail: data.personalEmail,
        companyEmail: data.companyEmail,
        branchId: data.departmentId,
        assets: data.assetIds?.length
          ? {
              create: data.assetIds.map((assetId) => ({
                assetId,
              })),
            }
          : undefined,
        attachments: data.attachments?.length
          ? {
              create: data.attachments.map((attachment) => ({
                url: attachment.url,
                fileName: attachment.fileName,
                fileSize: attachment.fileSize,
                mimeType: attachment.mimeType,
              })),
            }
          : undefined,
      },
      include: this.includeRelations,
    });
  }

  /**
   * Update employee
   */
  async update(
    id: string,
    data: Partial<{
      name: string;
      civilId: string | null;
      civilIdExpiryDate: Date | null;
      passportNo: string | null;
      passportExpiryDate: Date | null;
      nationality: string | null;
      jobTitle: string | null;
      startDate: Date | null;
      type: EmploymentType;
      salary: number | null;
      iban: string | null;
      personalEmail: string | null;
      companyEmail: string | null;
      departmentId: string | null;
      assetIds?: string[];
      attachments?: Array<{
        url: string;
        fileName?: string;
        fileSize?: number;
        mimeType?: string;
      }>;
    }>,
  ) {
    const updateData: any = { ...data };
    delete updateData.assetIds;
    delete updateData.attachments;

    // Handle assets replacement if provided
    if (data.assetIds !== undefined) {
      updateData.assets = {
        deleteMany: {},
        ...(data.assetIds.length > 0 && {
          create: data.assetIds.map((assetId) => ({
            assetId,
          })),
        }),
      };
    }

    // Handle attachments replacement if provided
    if (data.attachments !== undefined) {
      updateData.attachments = {
        deleteMany: {},
        ...(data.attachments.length > 0 && {
          create: data.attachments.map((attachment) => ({
            url: attachment.url,
            fileName: attachment.fileName,
            fileSize: attachment.fileSize,
            mimeType: attachment.mimeType,
          })),
        }),
      };
    }

    return this.prisma.employee.update({
      where: { id },
      data: updateData,
      include: this.includeRelations,
    });
  }

  /**
   * Soft delete employee (set status to DELETED)
   */
  async delete(id: string) {
    return this.prisma.employee.update({
      where: { id },
      data: {
        status: EmployeeStatus.DELETED,
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Restore deleted employee (set status back to ACTIVE)
   */
  async restore(id: string) {
    return this.prisma.employee.update({
      where: { id },
      data: {
        status: EmployeeStatus.ACTIVE,
        deletedAt: null,
      },
      include: this.includeRelations,
    });
  }

  /**
   * Permanently delete employee (hard delete)
   */
  async permanentDelete(id: string) {
    return this.prisma.employee.delete({
      where: { id },
    });
  }

  /**
   * Check if employee exists (only active employees)
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.employee.count({
      where: {
        id,
        ...this.activeCondition,
      },
    });
    return count > 0;
  }

  /**
   * Check if company email exists (only active employees, excluding specific employee)
   */
  async companyEmailExists(
    companyEmail: string,
    excludeEmployeeId?: string,
  ): Promise<boolean> {
    const count = await this.prisma.employee.count({
      where: {
        companyEmail,
        ...this.activeCondition,
        ...(excludeEmployeeId && { id: { not: excludeEmployeeId } }),
      },
    });
    return count > 0;
  }

  /**
   * Assign asset to employee
   */
  async assignAsset(employeeId: string, assetId: string) {
    return this.prisma.employeeAsset.create({
      data: {
        employeeId,
        assetId,
      },
      include: {
        asset: true,
      },
    });
  }

  /**
   * Unassign asset from employee
   */
  async unassignAsset(employeeId: string, assetId: string) {
    return this.prisma.employeeAsset.deleteMany({
      where: {
        employeeId,
        assetId,
      },
    });
  }

  /**
   * Check if asset is assigned to employee
   */
  async isAssetAssigned(employeeId: string, assetId: string): Promise<boolean> {
    const count = await this.prisma.employeeAsset.count({
      where: {
        employeeId,
        assetId,
      },
    });
    return count > 0;
  }

  /**
   * Add attachment to employee
   */
  async addAttachment(
    employeeId: string,
    data: {
      url: string;
      fileName?: string;
      fileSize?: number;
      mimeType?: string;
    },
  ) {
    return this.prisma.employeeAttachment.create({
      data: {
        employeeId,
        url: data.url,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
      },
    });
  }

  /**
   * Delete attachment
   */
  async deleteAttachment(attachmentId: string) {
    return this.prisma.employeeAttachment.delete({
      where: { id: attachmentId },
    });
  }

  /**
   * Get employee attachments
   */
  async getAttachments(employeeId: string) {
    return this.prisma.employeeAttachment.findMany({
      where: { employeeId },
      orderBy: {
        uploadedAt: 'desc',
      },
    });
  }

  /**
   * Check if attachment belongs to employee
   */
  async attachmentBelongsToEmployee(
    attachmentId: string,
    employeeId: string,
  ): Promise<boolean> {
    const count = await this.prisma.employeeAttachment.count({
      where: {
        id: attachmentId,
        employeeId,
      },
    });
    return count > 0;
  }
}

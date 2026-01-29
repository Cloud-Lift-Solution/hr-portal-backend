import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { SalaryCertificateStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { TranslatedException } from '../../../common/exceptions/business.exception';
import {
  CreateSalaryCertificateRequestDto,
  UpdateSalaryCertificateStatusDto,
  SalaryCertificateRequestResponseDto,
} from './dto';

@Injectable()
export class SalaryCertificateRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  private readonly includeRelations = {
    employee: {
      select: {
        id: true,
        name: true,
        companyEmail: true,
        department: {
          select: { id: true, name: true },
        },
      },
    },
  };

  async create(
    employeeId: string,
    dto: CreateSalaryCertificateRequestDto,
  ): Promise<SalaryCertificateRequestResponseDto> {
    // Validate employee exists and is active
    await this.ensureEmployeeActive(employeeId);

    // Create salary certificate request
    const created = await this.prisma.salaryCertificateRequest.create({
      data: {
        employeeId,
        reason: dto.reason,
        description: dto.description,
        status: SalaryCertificateStatus.PENDING,
      },
      include: this.includeRelations,
    });

    return this.mapToResponseDto(created);
  }

  async findMyRequests(
    employeeId: string,
  ): Promise<SalaryCertificateRequestResponseDto[]> {
    const requests = await this.prisma.salaryCertificateRequest.findMany({
      where: { employeeId },
      include: this.includeRelations,
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((r) => this.mapToResponseDto(r));
  }

  async findAll(): Promise<SalaryCertificateRequestResponseDto[]> {
    const requests = await this.prisma.salaryCertificateRequest.findMany({
      include: this.includeRelations,
      orderBy: [{ createdAt: 'desc' }],
    });

    return requests.map((r) => this.mapToResponseDto(r));
  }

  async findOne(id: string): Promise<SalaryCertificateRequestResponseDto> {
    const request = await this.prisma.salaryCertificateRequest.findUnique({
      where: { id },
      include: this.includeRelations,
    });

    if (!request) {
      throw TranslatedException.notFound('salaryCertificate.notFound');
    }

    return this.mapToResponseDto(request);
  }

  async updateStatus(
    id: string,
    dto: UpdateSalaryCertificateStatusDto,
    lang: string,
  ): Promise<SalaryCertificateRequestResponseDto> {
    const request = await this.prisma.salaryCertificateRequest.findUnique({
      where: { id },
      include: this.includeRelations,
    });

    if (!request) {
      throw TranslatedException.notFound('salaryCertificate.notFound');
    }

    // Can't update status if already approved or rejected
    if (request.status !== SalaryCertificateStatus.PENDING) {
      throw TranslatedException.badRequest('salaryCertificate.alreadyProcessed');
    }

    // Update status
    const updated = await this.prisma.salaryCertificateRequest.update({
      where: { id },
      data: { status: dto.status },
      include: this.includeRelations,
    });

    return this.mapToResponseDto(updated);
  }

  // Helper methods
  private async ensureEmployeeActive(employeeId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: {
        id: employeeId,
        status: 'ACTIVE',
      },
    });

    if (!employee) {
      throw TranslatedException.notFound('salaryCertificate.employeeNotFoundOrInactive');
    }
  }

  private mapToResponseDto(entity: any): SalaryCertificateRequestResponseDto {
    const employee = entity.employee;

    return {
      id: entity.id,
      employee: {
        id: employee.id,
        name: employee.name,
        companyEmail: employee.companyEmail,
        department: employee.department
          ? { id: employee.department.id, name: employee.department.name }
          : null,
      },
      reason: entity.reason,
      description: entity.description,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

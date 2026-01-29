import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { SalaryAdvanceStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { TranslatedException } from '../../../common/exceptions/business.exception';
import {
  CreateSalaryAdvanceRequestDto,
  UpdateSalaryAdvanceStatusDto,
  SalaryAdvanceRequestResponseDto,
} from './dto';

@Injectable()
export class SalaryAdvanceRequestService {
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
    dto: CreateSalaryAdvanceRequestDto,
  ): Promise<SalaryAdvanceRequestResponseDto> {
    // Validate employee exists and is active
    await this.ensureEmployeeActive(employeeId);

    // Check for existing pending request for same month/year
    const existingRequest = await this.prisma.salaryAdvanceRequest.findFirst({
      where: {
        employeeId,
        month: dto.month,
        year: dto.year,
        status: SalaryAdvanceStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw TranslatedException.conflict('salaryAdvance.requestAlreadyPending');
    }

    // Create salary advance request
    const created = await this.prisma.salaryAdvanceRequest.create({
      data: {
        employeeId,
        month: dto.month,
        year: dto.year,
        description: dto.description,
        status: SalaryAdvanceStatus.PENDING,
      },
      include: this.includeRelations,
    });

    return this.mapToResponseDto(created);
  }

  async findMyRequests(
    employeeId: string,
  ): Promise<SalaryAdvanceRequestResponseDto[]> {
    const requests = await this.prisma.salaryAdvanceRequest.findMany({
      where: { employeeId },
      include: this.includeRelations,
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((r) => this.mapToResponseDto(r));
  }

  async findAll(): Promise<SalaryAdvanceRequestResponseDto[]> {
    const requests = await this.prisma.salaryAdvanceRequest.findMany({
      include: this.includeRelations,
      orderBy: [{ createdAt: 'desc' }],
    });

    return requests.map((r) => this.mapToResponseDto(r));
  }

  async findOne(id: string): Promise<SalaryAdvanceRequestResponseDto> {
    const request = await this.prisma.salaryAdvanceRequest.findUnique({
      where: { id },
      include: this.includeRelations,
    });

    if (!request) {
      throw TranslatedException.notFound('salaryAdvance.notFound');
    }

    return this.mapToResponseDto(request);
  }

  async updateStatus(
    id: string,
    dto: UpdateSalaryAdvanceStatusDto,
    lang: string,
  ): Promise<SalaryAdvanceRequestResponseDto> {
    const request = await this.prisma.salaryAdvanceRequest.findUnique({
      where: { id },
      include: this.includeRelations,
    });

    if (!request) {
      throw TranslatedException.notFound('salaryAdvance.notFound');
    }

    // Can't update status if already approved or rejected
    if (request.status !== SalaryAdvanceStatus.PENDING) {
      throw TranslatedException.badRequest('salaryAdvance.alreadyProcessed');
    }

    // Update status
    const updated = await this.prisma.salaryAdvanceRequest.update({
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
      throw TranslatedException.notFound('salaryAdvance.employeeNotFoundOrInactive');
    }
  }

  private mapToResponseDto(entity: any): SalaryAdvanceRequestResponseDto {
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
      month: entity.month,
      year: entity.year,
      description: entity.description,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { SickLeaveStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { TranslatedException } from '../../../common/exceptions/business.exception';
import {
  CreateSickLeaveRequestDto,
  UpdateSickLeaveStatusDto,
  SickLeaveRequestResponseDto,
} from './dto';

@Injectable()
export class SickLeaveRequestService {
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
    dto: CreateSickLeaveRequestDto,
  ): Promise<SickLeaveRequestResponseDto> {
    // Validate employee exists and is active
    await this.ensureEmployeeActive(employeeId);

    // Validate dates
    const departure = this.ensureValidDate(
      dto.departureDay,
      'sickLeave.departureInvalid',
    );
    const returning = this.ensureValidDate(
      dto.returnDay,
      'sickLeave.returnInvalid',
    );
    this.ensureDepartureBeforeOrEqualReturn(departure, returning);

    const normalizedDeparture = this.toStartOfDay(departure);
    const normalizedReturn = this.toStartOfDay(returning);

    // Check for overlapping sick leave requests (pending or approved)
    await this.ensureNoOverlap(
      employeeId,
      normalizedDeparture,
      normalizedReturn,
    );

    // Validate numberOfDays matches the date range
    const calculatedDays = this.calculateInclusiveDays(
      normalizedDeparture,
      normalizedReturn,
    );
    if (calculatedDays !== dto.numberOfDays) {
      throw TranslatedException.badRequest('sickLeave.numberOfDaysMismatch');
    }

    // Create sick leave request with PENDING status
    const created = await this.prisma.sickLeave.create({
      data: {
        employeeId,
        departureDay: normalizedDeparture,
        returnDay: normalizedReturn,
        reason: dto.reason,
        numberOfDays: dto.numberOfDays,
        attachmentUrls: dto.attachmentUrls || [],
        status: SickLeaveStatus.PENDING,
      },
      include: this.includeRelations,
    });

    return this.mapToResponseDto(created);
  }

  async findMyRequests(
    employeeId: string,
  ): Promise<SickLeaveRequestResponseDto[]> {
    const requests = await this.prisma.sickLeave.findMany({
      where: { employeeId },
      include: this.includeRelations,
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((r) => this.mapToResponseDto(r));
  }

  async findAll(): Promise<SickLeaveRequestResponseDto[]> {
    const requests = await this.prisma.sickLeave.findMany({
      include: this.includeRelations,
      orderBy: [{ createdAt: 'desc' }],
    });

    return requests.map((r) => this.mapToResponseDto(r));
  }

  async findOne(id: string): Promise<SickLeaveRequestResponseDto> {
    const request = await this.prisma.sickLeave.findUnique({
      where: { id },
      include: this.includeRelations,
    });

    if (!request) {
      throw TranslatedException.notFound('sickLeave.notFound');
    }

    return this.mapToResponseDto(request);
  }

  async updateStatus(
    id: string,
    dto: UpdateSickLeaveStatusDto,
    lang: string,
  ): Promise<SickLeaveRequestResponseDto> {
    const request = await this.prisma.sickLeave.findUnique({
      where: { id },
      include: this.includeRelations,
    });

    if (!request) {
      throw TranslatedException.notFound('sickLeave.notFound');
    }

    // Can't update status if already approved or rejected
    if (request.status !== SickLeaveStatus.PENDING) {
      throw TranslatedException.badRequest('sickLeave.alreadyProcessed');
    }

    // Update sick leave status (no balance deduction needed)
    const updated = await this.prisma.sickLeave.update({
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
      throw TranslatedException.notFound(
        'sickLeave.employeeNotFoundOrInactive',
      );
    }
  }

  private ensureValidDate(input: string, key: string): Date {
    const d = new Date(input);
    if (isNaN(d.getTime())) {
      throw TranslatedException.badRequest(key);
    }
    return d;
  }

  private ensureDepartureBeforeOrEqualReturn(dep: Date, ret: Date) {
    if (this.toStartOfDay(dep).getTime() > this.toStartOfDay(ret).getTime()) {
      throw TranslatedException.badRequest('sickLeave.returnBeforeDeparture');
    }
  }

  private toStartOfDay(d: Date): Date {
    return new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
    );
  }

  private calculateInclusiveDays(dep: Date, ret: Date): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    const diff =
      (this.toStartOfDay(ret).getTime() - this.toStartOfDay(dep).getTime()) /
      msPerDay;
    return Math.floor(diff) + 1;
  }

  private async ensureNoOverlap(
    employeeId: string,
    dep: Date,
    ret: Date,
    excludeId?: string,
  ) {
    const count = await this.prisma.sickLeave.count({
      where: {
        employeeId,
        status: {
          in: [SickLeaveStatus.PENDING, SickLeaveStatus.APPROVED],
        },
        ...(excludeId && { id: { not: excludeId } }),
        returnDay: { gte: dep },
        departureDay: { lte: ret },
      },
    });

    if (count > 0) {
      throw TranslatedException.conflict('sickLeave.overlapExists');
    }
  }

  private mapToResponseDto(entity: any): SickLeaveRequestResponseDto {
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
      departureDay: entity.departureDay,
      returnDay: entity.returnDay,
      reason: entity.reason,
      numberOfDays: entity.numberOfDays,
      attachmentUrls: Array.isArray(entity.attachmentUrls)
        ? entity.attachmentUrls
        : [],
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

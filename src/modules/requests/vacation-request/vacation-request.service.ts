import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { VacationStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { TranslatedException } from '../../../common/exceptions/business.exception';
import {
  CreateVacationRequestDto,
  UpdateVacationStatusDto,
  VacationRequestResponseDto,
} from './dto';

@Injectable()
export class VacationRequestService {
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
        totalVacationDays: true,
        usedVacationDays: true,
        department: {
          select: { id: true, name: true },
        },
      },
    },
  };

  async create(
    employeeId: string,
    dto: CreateVacationRequestDto,
  ): Promise<VacationRequestResponseDto> {
    // Validate employee exists and is active
    await this.ensureEmployeeActive(employeeId);

    // Validate dates
    const departure = this.ensureValidDate(
      dto.departureDay,
      'vacation.departureInvalid',
    );
    const returning = this.ensureValidDate(
      dto.returnDay,
      'vacation.returnInvalid',
    );
    this.ensureDepartureBeforeOrEqualReturn(departure, returning);

    const normalizedDeparture = this.toStartOfDay(departure);
    const normalizedReturn = this.toStartOfDay(returning);

    // Check for overlapping vacation requests (pending or approved)
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
      throw TranslatedException.badRequest('vacation.numberOfDaysMismatch');
    }

    // Create vacation request with PENDING status
    const created = await this.prisma.vacation.create({
      data: {
        employeeId,
        departureDay: normalizedDeparture,
        returnDay: normalizedReturn,
        reason: dto.reason,
        type: dto.type,
        numberOfDays: dto.numberOfDays,
        description: dto.description,
        attachmentUrls: dto.attachmentUrls || [],
        status: VacationStatus.PENDING,
      },
      include: this.includeRelations,
    });

    return this.mapToResponseDto(created);
  }

  async findMyRequests(employeeId: string): Promise<VacationRequestResponseDto[]> {
    const requests = await this.prisma.vacation.findMany({
      where: { employeeId },
      include: this.includeRelations,
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((r) => this.mapToResponseDto(r));
  }

  async findAll(): Promise<VacationRequestResponseDto[]> {
    const requests = await this.prisma.vacation.findMany({
      include: this.includeRelations,
      orderBy: [{ createdAt: 'desc' }],
    });

    return requests.map((r) => this.mapToResponseDto(r));
  }

  async findOne(id: string): Promise<VacationRequestResponseDto> {
    const request = await this.prisma.vacation.findUnique({
      where: { id },
      include: this.includeRelations,
    });

    if (!request) {
      throw TranslatedException.notFound('vacation.notFound');
    }

    return this.mapToResponseDto(request);
  }

  async updateStatus(
    id: string,
    dto: UpdateVacationStatusDto,
    lang: string,
  ): Promise<VacationRequestResponseDto> {
    const request = await this.prisma.vacation.findUnique({
      where: { id },
      include: this.includeRelations,
    });

    if (!request) {
      throw TranslatedException.notFound('vacation.notFound');
    }

    // Can't update status if already approved or rejected
    if (request.status !== VacationStatus.PENDING) {
      throw TranslatedException.badRequest('vacation.alreadyProcessed');
    }

    // If approving, check balance and deduct days
    if (dto.status === VacationStatus.APPROVED) {
      const employee = request.employee;
      const availableDays =
        Number(employee.totalVacationDays) - Number(employee.usedVacationDays);

      if (availableDays < request.numberOfDays) {
        throw TranslatedException.badRequest('vacation.insufficientBalance');
      }

      // Update vacation status and employee used days in a transaction
      const updated = await this.prisma.$transaction(async (tx) => {
        // Update employee's used vacation days
        await tx.employee.update({
          where: { id: request.employeeId },
          data: {
            usedVacationDays: {
              increment: request.numberOfDays,
            },
          },
        });

        // Update vacation status
        return tx.vacation.update({
          where: { id },
          data: { status: dto.status },
          include: this.includeRelations,
        });
      });

      return this.mapToResponseDto(updated);
    }

    // If rejecting, just update status
    const updated = await this.prisma.vacation.update({
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
        'vacation.employeeNotFoundOrInactive',
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
      throw TranslatedException.badRequest('vacation.returnBeforeDeparture');
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
    const count = await this.prisma.vacation.count({
      where: {
        employeeId,
        status: {
          in: [VacationStatus.PENDING, VacationStatus.APPROVED],
        },
        ...(excludeId && { id: { not: excludeId } }),
        returnDay: { gte: dep },
        departureDay: { lte: ret },
      },
    });

    if (count > 0) {
      throw TranslatedException.conflict('vacation.overlapExists');
    }
  }

  private mapToResponseDto(entity: any): VacationRequestResponseDto {
    const employee = entity.employee;
    const totalVacationDays = Number(employee.totalVacationDays);
    const usedVacationDays = Number(employee.usedVacationDays);

    return {
      id: entity.id,
      employee: {
        id: employee.id,
        name: employee.name,
        companyEmail: employee.companyEmail,
        department: employee.department
          ? { id: employee.department.id, name: employee.department.name }
          : null,
        totalVacationDays,
        usedVacationDays,
        availableVacationDays: totalVacationDays - usedVacationDays,
      },
      departureDay: entity.departureDay,
      returnDay: entity.returnDay,
      reason: entity.reason,
      type: entity.type,
      numberOfDays: entity.numberOfDays,
      description: entity.description,
      attachmentUrls: Array.isArray(entity.attachmentUrls)
        ? entity.attachmentUrls
        : [],
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

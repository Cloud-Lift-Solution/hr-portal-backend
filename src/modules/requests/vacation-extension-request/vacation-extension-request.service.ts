import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { VacationExtensionStatus, VacationStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { TranslatedException } from '../../../common/exceptions/business.exception';
import {
  CreateVacationExtensionRequestDto,
  UpdateVacationExtensionStatusDto,
  VacationExtensionRequestResponseDto,
} from './dto';

@Injectable()
export class VacationExtensionRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  private readonly includeRelations = {
    vacation: {
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            companyEmail: true,
            totalVacationDays: true,
            usedVacationDays: true,
            branch: {
              select: {
                id: true,
                translations: {
                  select: {
                    name: true,
                  },
                },
                department: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    },
  };

  async create(
    employeeId: string,
    dto: CreateVacationExtensionRequestDto,
  ): Promise<VacationExtensionRequestResponseDto> {
    // Find the vacation and verify ownership
    const vacation = await this.prisma.vacation.findUnique({
      where: { id: dto.vacationId },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            companyEmail: true,
            totalVacationDays: true,
            usedVacationDays: true,
            branch: {
              select: {
                id: true,
                translations: {
                  select: {
                    name: true,
                  },
                },
                department: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (!vacation) {
      throw TranslatedException.notFound('vacation.notFound');
    }

    // Verify the vacation belongs to the employee
    if (vacation.employeeId !== employeeId) {
      throw TranslatedException.forbidden('vacation.notOwner');
    }

    // Can only extend approved vacations
    if (vacation.status !== VacationStatus.APPROVED) {
      throw TranslatedException.badRequest('vacation.canOnlyExtendApproved');
    }

    // Validate extendToDate is after current returnDay
    const extendToDate = this.ensureValidDate(dto.extendToDate, 'vacation.extendToDateInvalid');
    const normalizedExtendToDate = this.toStartOfDay(extendToDate);
    const currentReturnDay = this.toStartOfDay(vacation.returnDay);

    if (normalizedExtendToDate.getTime() <= currentReturnDay.getTime()) {
      throw TranslatedException.badRequest('vacation.extendToDateMustBeAfterReturn');
    }

    // Calculate additional days
    const additionalDays = this.calculateInclusiveDays(
      new Date(currentReturnDay.getTime() + 24 * 60 * 60 * 1000), // Day after current return
      normalizedExtendToDate,
    );

    // Check for pending extension requests
    const pendingRequest = await this.prisma.vacationExtensionRequest.findFirst({
      where: {
        vacationId: dto.vacationId,
        status: VacationExtensionStatus.PENDING,
      },
    });

    if (pendingRequest) {
      throw TranslatedException.conflict('vacation.extensionRequestPending');
    }

    // Create extension request
    const created = await this.prisma.vacationExtensionRequest.create({
      data: {
        vacationId: dto.vacationId,
        extendToDate: normalizedExtendToDate,
        additionalDays,
        description: dto.description,
        attachmentUrls: dto.attachmentUrls || [],
        status: VacationExtensionStatus.PENDING,
      },
      include: this.includeRelations,
    });

    return this.mapToResponseDto(created);
  }

  async findMyRequests(
    employeeId: string,
  ): Promise<VacationExtensionRequestResponseDto[]> {
    const requests = await this.prisma.vacationExtensionRequest.findMany({
      where: {
        vacation: {
          employeeId,
        },
      },
      include: this.includeRelations,
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((r) => this.mapToResponseDto(r));
  }

  async findAll(): Promise<VacationExtensionRequestResponseDto[]> {
    const requests = await this.prisma.vacationExtensionRequest.findMany({
      include: this.includeRelations,
      orderBy: [{ createdAt: 'desc' }],
    });

    return requests.map((r) => this.mapToResponseDto(r));
  }

  async findOne(id: string): Promise<VacationExtensionRequestResponseDto> {
    const request = await this.prisma.vacationExtensionRequest.findUnique({
      where: { id },
      include: this.includeRelations,
    });

    if (!request) {
      throw TranslatedException.notFound('vacation.extensionNotFound');
    }

    return this.mapToResponseDto(request);
  }

  async updateStatus(
    id: string,
    dto: UpdateVacationExtensionStatusDto,
    lang: string,
  ): Promise<VacationExtensionRequestResponseDto> {
    const request = await this.prisma.vacationExtensionRequest.findUnique({
      where: { id },
      include: this.includeRelations,
    });

    if (!request) {
      throw TranslatedException.notFound('vacation.extensionNotFound');
    }

    // Can't update status if already approved or rejected
    if (request.status !== VacationExtensionStatus.PENDING) {
      throw TranslatedException.badRequest('vacation.extensionAlreadyProcessed');
    }

    // If approving, check balance and update vacation
    if (dto.status === VacationExtensionStatus.APPROVED) {
      const employee = request.vacation.employee;
      const availableDays =
        Number(employee.totalVacationDays) - Number(employee.usedVacationDays);

      if (availableDays < request.additionalDays) {
        throw TranslatedException.badRequest('vacation.insufficientBalance');
      }

      // Update extension status, vacation dates, and employee used days in a transaction
      const updated = await this.prisma.$transaction(async (tx) => {
        // Update employee's used vacation days
        await tx.employee.update({
          where: { id: request.vacation.employeeId },
          data: {
            usedVacationDays: {
              increment: request.additionalDays,
            },
          },
        });

        // Update vacation's return day and number of days
        await tx.vacation.update({
          where: { id: request.vacationId },
          data: {
            returnDay: request.extendToDate,
            numberOfDays: {
              increment: request.additionalDays,
            },
          },
        });

        // Update extension request status
        return tx.vacationExtensionRequest.update({
          where: { id },
          data: { status: dto.status },
          include: this.includeRelations,
        });
      });

      return this.mapToResponseDto(updated);
    }

    // If rejecting, just update status
    const updated = await this.prisma.vacationExtensionRequest.update({
      where: { id },
      data: { status: dto.status },
      include: this.includeRelations,
    });

    return this.mapToResponseDto(updated);
  }

  // Helper methods
  private ensureValidDate(input: string, key: string): Date {
    const d = new Date(input);
    if (isNaN(d.getTime())) {
      throw TranslatedException.badRequest(key);
    }
    return d;
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

  private mapToResponseDto(entity: any): VacationExtensionRequestResponseDto {
    const vacation = entity.vacation;
    const employee = vacation.employee;
    const totalVacationDays = Number(employee.totalVacationDays);
    const usedVacationDays = Number(employee.usedVacationDays);

    return {
      id: entity.id,
      vacation: {
        id: vacation.id,
        departureDay: vacation.departureDay,
        returnDay: vacation.returnDay,
        reason: vacation.reason,
        type: vacation.type,
        numberOfDays: vacation.numberOfDays,
        status: vacation.status,
      },
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
      extendToDate: entity.extendToDate,
      additionalDays: entity.additionalDays,
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

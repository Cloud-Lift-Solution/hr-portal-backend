import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { VacationCancellationStatus, VacationStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { TranslatedException } from '../../../common/exceptions/business.exception';
import {
  CreateVacationCancellationRequestDto,
  UpdateVacationCancellationStatusDto,
  VacationCancellationRequestResponseDto,
} from './dto';

@Injectable()
export class VacationCancellationRequestService {
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
            department: {
              select: { id: true, name: true },
            },
          },
        },
      },
    },
  };

  async create(
    employeeId: string,
    dto: CreateVacationCancellationRequestDto,
  ): Promise<VacationCancellationRequestResponseDto> {
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
            department: {
              select: { id: true, name: true },
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

    // Can only cancel pending or approved vacations
    if (
      vacation.status !== VacationStatus.PENDING &&
      vacation.status !== VacationStatus.APPROVED
    ) {
      throw TranslatedException.badRequest('vacation.cannotCancel');
    }

    // Check for pending cancellation requests
    const pendingRequest = await this.prisma.vacationCancellationRequest.findFirst({
      where: {
        vacationId: dto.vacationId,
        status: VacationCancellationStatus.PENDING,
      },
    });

    if (pendingRequest) {
      throw TranslatedException.conflict('vacation.cancellationRequestPending');
    }

    // Create cancellation request
    const created = await this.prisma.vacationCancellationRequest.create({
      data: {
        vacationId: dto.vacationId,
        description: dto.description,
        attachmentUrls: dto.attachmentUrls || [],
        status: VacationCancellationStatus.PENDING,
      },
      include: this.includeRelations,
    });

    return this.mapToResponseDto(created);
  }

  async findMyRequests(
    employeeId: string,
  ): Promise<VacationCancellationRequestResponseDto[]> {
    const requests = await this.prisma.vacationCancellationRequest.findMany({
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

  async findAll(): Promise<VacationCancellationRequestResponseDto[]> {
    const requests = await this.prisma.vacationCancellationRequest.findMany({
      include: this.includeRelations,
      orderBy: [{ createdAt: 'desc' }],
    });

    return requests.map((r) => this.mapToResponseDto(r));
  }

  async findOne(id: string): Promise<VacationCancellationRequestResponseDto> {
    const request = await this.prisma.vacationCancellationRequest.findUnique({
      where: { id },
      include: this.includeRelations,
    });

    if (!request) {
      throw TranslatedException.notFound('vacation.cancellationNotFound');
    }

    return this.mapToResponseDto(request);
  }

  async updateStatus(
    id: string,
    dto: UpdateVacationCancellationStatusDto,
    lang: string,
  ): Promise<VacationCancellationRequestResponseDto> {
    const request = await this.prisma.vacationCancellationRequest.findUnique({
      where: { id },
      include: this.includeRelations,
    });

    if (!request) {
      throw TranslatedException.notFound('vacation.cancellationNotFound');
    }

    // Can't update status if already approved or rejected
    if (request.status !== VacationCancellationStatus.PENDING) {
      throw TranslatedException.badRequest('vacation.cancellationAlreadyProcessed');
    }

    // If approving, update vacation status and refund days if vacation was approved
    if (dto.status === VacationCancellationStatus.APPROVED) {
      const vacation = request.vacation;
      const wasApproved = vacation.status === VacationStatus.APPROVED;

      // Update cancellation status, vacation status, and refund days in a transaction
      const updated = await this.prisma.$transaction(async (tx) => {
        // If vacation was approved, refund the days to employee
        if (wasApproved) {
          await tx.employee.update({
            where: { id: vacation.employeeId },
            data: {
              usedVacationDays: {
                decrement: vacation.numberOfDays,
              },
            },
          });
        }

        // Update vacation status to CANCELLED
        await tx.vacation.update({
          where: { id: request.vacationId },
          data: {
            status: VacationStatus.CANCELLED,
          },
        });

        // Update cancellation request status
        return tx.vacationCancellationRequest.update({
          where: { id },
          data: { status: dto.status },
          include: this.includeRelations,
        });
      });

      return this.mapToResponseDto(updated);
    }

    // If rejecting, just update status
    const updated = await this.prisma.vacationCancellationRequest.update({
      where: { id },
      data: { status: dto.status },
      include: this.includeRelations,
    });

    return this.mapToResponseDto(updated);
  }

  private mapToResponseDto(entity: any): VacationCancellationRequestResponseDto {
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

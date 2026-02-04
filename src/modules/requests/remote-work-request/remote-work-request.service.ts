import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { RemoteWorkStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { TranslatedException } from '../../../common/exceptions/business.exception';
import {
  CreateRemoteWorkRequestDto,
  UpdateRemoteWorkStatusDto,
  RemoteWorkRequestResponseDto,
} from './dto';

@Injectable()
export class RemoteWorkRequestService {
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
        branch: {
          select: {
            id: true,
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
    dto: CreateRemoteWorkRequestDto,
  ): Promise<RemoteWorkRequestResponseDto> {
    // Validate employee exists and is active
    await this.ensureEmployeeActive(employeeId);

    // Check for existing pending request for the same date
    const existingRequest = await this.prisma.remoteWorkRequest.findFirst({
      where: {
        employeeId,
        requestDate: new Date(dto.requestDate),
        status: RemoteWorkStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw TranslatedException.conflict('remoteWork.requestAlreadyPending');
    }

    // Create remote work request
    const created = await this.prisma.remoteWorkRequest.create({
      data: {
        employeeId,
        requestDate: new Date(dto.requestDate),
        description: dto.description,
        status: RemoteWorkStatus.PENDING,
      },
      include: this.includeRelations,
    });

    return this.mapToResponseDto(created);
  }

  async findMyRequests(
    employeeId: string,
  ): Promise<RemoteWorkRequestResponseDto[]> {
    const requests = await this.prisma.remoteWorkRequest.findMany({
      where: { employeeId },
      include: this.includeRelations,
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((r) => this.mapToResponseDto(r));
  }

  async findAll(): Promise<RemoteWorkRequestResponseDto[]> {
    const requests = await this.prisma.remoteWorkRequest.findMany({
      include: this.includeRelations,
      orderBy: [{ createdAt: 'desc' }],
    });

    return requests.map((r) => this.mapToResponseDto(r));
  }

  async findOne(id: string): Promise<RemoteWorkRequestResponseDto> {
    const request = await this.prisma.remoteWorkRequest.findUnique({
      where: { id },
      include: this.includeRelations,
    });

    if (!request) {
      throw TranslatedException.notFound('remoteWork.notFound');
    }

    return this.mapToResponseDto(request);
  }

  async updateStatus(
    id: string,
    dto: UpdateRemoteWorkStatusDto,
    lang: string,
  ): Promise<RemoteWorkRequestResponseDto> {
    const request = await this.prisma.remoteWorkRequest.findUnique({
      where: { id },
      include: this.includeRelations,
    });

    if (!request) {
      throw TranslatedException.notFound('remoteWork.notFound');
    }

    // Can't update status if already approved or rejected
    if (request.status !== RemoteWorkStatus.PENDING) {
      throw TranslatedException.badRequest('remoteWork.alreadyProcessed');
    }

    // Update status
    const updated = await this.prisma.remoteWorkRequest.update({
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
        'remoteWork.employeeNotFoundOrInactive',
      );
    }
  }

  private mapToResponseDto(entity: any): RemoteWorkRequestResponseDto {
    const employee = entity.employee;
    const department = employee.branch?.department || null;

    return {
      id: entity.id,
      employee: {
        id: employee.id,
        name: employee.name,
        companyEmail: employee.companyEmail,
        department: department
          ? { id: department.id, name: department.name }
          : null,
      },
      requestDate: entity.requestDate,
      description: entity.description,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

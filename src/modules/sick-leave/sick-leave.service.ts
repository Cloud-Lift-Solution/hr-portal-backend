import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { SickLeaveRepository } from './repositories/sick-leave.repository';
import { EmployeeRepository } from '../employee/repositories/employee.repository';
import {
  CreateSickLeaveDto,
  UpdateSickLeaveDto,
  SickLeaveQueryDto,
  SickLeaveResponseDto,
} from './dto';
import { TranslatedException } from '../../common/exceptions/business.exception';

@Injectable()
export class SickLeaveService {
  constructor(
    private readonly sickLeaveRepository: SickLeaveRepository,
    private readonly employeeRepository: EmployeeRepository,
    private readonly i18n: I18nService,
  ) {}

  async findAll(query: SickLeaveQueryDto): Promise<SickLeaveResponseDto[]> {
    const filters = {
      search: query.search,
      status: query.status?.toLowerCase() as any,
      employeeId: query.employeeId,
      year: query.year ? parseInt(query.year, 10) : undefined,
      month: query.month,
    };

    const items = await this.sickLeaveRepository.findAll(filters);
    return items.map((s) => this.mapToResponseDto(s));
  }

  async findOne(id: string): Promise<SickLeaveResponseDto> {
    const s = await this.sickLeaveRepository.findById(id);
    if (!s) throw TranslatedException.notFound('sickLeave.notFound');
    return this.mapToResponseDto(s);
  }

  async create(
    dto: CreateSickLeaveDto,
    lang: string,
  ): Promise<SickLeaveResponseDto> {
    await this.ensureEmployeeActive(dto.employeeId);

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

    await this.ensureNoOverlap(
      dto.employeeId,
      normalizedDeparture,
      normalizedReturn,
    );

    const numberOfDays = this.calculateInclusiveDays(
      normalizedDeparture,
      normalizedReturn,
    );

    const created = await this.sickLeaveRepository.create({
      employeeId: dto.employeeId,
      departureDay: normalizedDeparture,
      returnDay: normalizedReturn,
      reason: dto.reason?.trim() || null,
      numberOfDays,
      attachmentUrl: dto.attachmentUrl?.trim() || null,
    });

    return this.mapToResponseDto(created);
  }

  async update(
    id: string,
    dto: UpdateSickLeaveDto,
    lang: string,
  ): Promise<SickLeaveResponseDto> {
    const existing = await this.sickLeaveRepository.findById(id);
    if (!existing) throw TranslatedException.notFound('sickLeave.notFound');

    if (dto.employeeId) await this.ensureEmployeeActive(dto.employeeId);

    const departure = dto.departureDay
      ? this.ensureValidDate(dto.departureDay, 'sickLeave.departureInvalid')
      : existing.departureDay;
    const returning = dto.returnDay
      ? this.ensureValidDate(dto.returnDay, 'sickLeave.returnInvalid')
      : existing.returnDay;

    this.ensureDepartureBeforeOrEqualReturn(departure, returning);

    const normalizedDeparture = this.toStartOfDay(departure);
    const normalizedReturn = this.toStartOfDay(returning);

    const employeeId = dto.employeeId ?? existing.employee.id;
    await this.ensureNoOverlap(
      employeeId,
      normalizedDeparture,
      normalizedReturn,
      id,
    );

    const numberOfDays = this.calculateInclusiveDays(
      normalizedDeparture,
      normalizedReturn,
    );

    const updated = await this.sickLeaveRepository.update(id, {
      employeeId: dto.employeeId,
      departureDay: dto.departureDay ? normalizedDeparture : undefined,
      returnDay: dto.returnDay ? normalizedReturn : undefined,
      reason: dto.reason !== undefined ? dto.reason?.trim() || null : undefined,
      numberOfDays,
      attachmentUrl:
        dto.attachmentUrl !== undefined
          ? dto.attachmentUrl?.trim() || null
          : undefined,
    });

    return this.mapToResponseDto(updated);
  }

  async remove(id: string, lang: string): Promise<{ message: string }> {
    const existing = await this.sickLeaveRepository.findById(id);
    if (!existing) throw TranslatedException.notFound('sickLeave.notFound');
    await this.sickLeaveRepository.delete(id);
    return {
      message: await this.i18n.translate('sickLeave.deleteSuccess', { lang }),
    };
  }

  // Helpers
  private async ensureEmployeeActive(employeeId: string) {
    const exists = await this.employeeRepository.exists(employeeId);
    if (!exists)
      throw TranslatedException.notFound(
        'sickLeave.employeeNotFoundOrInactive',
      );
  }

  private ensureValidDate(input: string, key: string): Date {
    const d = new Date(input);
    if (isNaN(d.getTime())) throw TranslatedException.badRequest(key);
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
    const overlaps = await this.sickLeaveRepository.overlapsExists(
      employeeId,
      dep,
      ret,
      excludeId,
    );
    if (overlaps) throw TranslatedException.conflict('sickLeave.overlapExists');
  }

  private mapToResponseDto(entity: any): SickLeaveResponseDto {
    return {
      id: entity.id,
      employee: {
        id: entity.employee.id,
        name: entity.employee.name,
        companyEmail: entity.employee.companyEmail,
        department: entity.employee.department
          ? {
              id: entity.employee.department.id,
              name: entity.employee.department.name,
            }
          : null,
      },
      departureDay: entity.departureDay,
      returnDay: entity.returnDay,
      reason: entity.reason ?? null,
      numberOfDays: entity.numberOfDays,
      attachmentUrl: entity.attachmentUrl ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

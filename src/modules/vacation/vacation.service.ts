import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { VacationReason, VacationType } from '@prisma/client';
import { VacationRepository } from './repositories/vacation.repository';
import { EmployeeRepository } from '../employee/repositories/employee.repository';
import { CreateVacationDto, UpdateVacationDto, VacationQueryDto, VacationResponseDto } from './dto';
import { TranslatedException } from '../../common/exceptions/business.exception';

@Injectable()
export class VacationService {
  constructor(
    private readonly vacationRepository: VacationRepository,
    private readonly employeeRepository: EmployeeRepository,
    private readonly i18n: I18nService,
  ) {}

  async findAll(query: VacationQueryDto): Promise<VacationResponseDto[]> {
    const filters = {
      search: query.search,
      status: query.status?.toLowerCase() as any,
      employeeId: query.employeeId,
      reason: query.reason,
      type: query.type,
      year: query.year ? parseInt(query.year, 10) : undefined,
      month: query.month,
    };

    const items = await this.vacationRepository.findAll(filters);
    return items.map((v) => this.mapToResponseDto(v));
  }

  async findOne(id: string): Promise<VacationResponseDto> {
    const v = await this.vacationRepository.findById(id);
    if (!v) throw TranslatedException.notFound('vacation.notFound');
    return this.mapToResponseDto(v);
  }

  async create(dto: CreateVacationDto, lang: string): Promise<VacationResponseDto> {
    await this.ensureEmployeeActive(dto.employeeId);

    const departure = this.ensureValidDate(dto.departureDay, 'vacation.departureInvalid');
    const returning = this.ensureValidDate(dto.returnDay, 'vacation.returnInvalid');
    this.ensureDepartureBeforeOrEqualReturn(departure, returning);

    const normalizedDeparture = this.toStartOfDay(departure);
    const normalizedReturn = this.toStartOfDay(returning);

    await this.ensureNoOverlap(dto.employeeId, normalizedDeparture, normalizedReturn);

    const numberOfDays = this.calculateInclusiveDays(normalizedDeparture, normalizedReturn);

    const created = await this.vacationRepository.create({
      employeeId: dto.employeeId,
      departureDay: normalizedDeparture,
      returnDay: normalizedReturn,
      reason: dto.reason,
      type: dto.type,
      numberOfDays,
    });

    return this.mapToResponseDto(created);
  }

  async update(id: string, dto: UpdateVacationDto, lang: string): Promise<VacationResponseDto> {
    const existing = await this.vacationRepository.findById(id);
    if (!existing) throw TranslatedException.notFound('vacation.notFound');

    if (dto.employeeId) await this.ensureEmployeeActive(dto.employeeId);

    const departure = dto.departureDay
      ? this.ensureValidDate(dto.departureDay, 'vacation.departureInvalid')
      : existing.departureDay;
    const returning = dto.returnDay
      ? this.ensureValidDate(dto.returnDay, 'vacation.returnInvalid')
      : existing.returnDay;

    this.ensureDepartureBeforeOrEqualReturn(departure, returning);

    const normalizedDeparture = this.toStartOfDay(departure);
    const normalizedReturn = this.toStartOfDay(returning);

    const employeeId = dto.employeeId ?? existing.employeeId;
    await this.ensureNoOverlap(employeeId, normalizedDeparture, normalizedReturn, id);

    const numberOfDays = this.calculateInclusiveDays(normalizedDeparture, normalizedReturn);

    const updated = await this.vacationRepository.update(id, {
      employeeId: dto.employeeId,
      departureDay: dto.departureDay ? normalizedDeparture : undefined,
      returnDay: dto.returnDay ? normalizedReturn : undefined,
      reason: dto.reason,
      type: dto.type,
      numberOfDays,
    });

    return this.mapToResponseDto(updated);
  }

  async remove(id: string, lang: string): Promise<{ message: string }> {
    const existing = await this.vacationRepository.findById(id);
    if (!existing) throw TranslatedException.notFound('vacation.notFound');
    await this.vacationRepository.delete(id);
    return { message: await this.i18n.translate('vacation.deleteSuccess', { lang }) };
  }

  // Helpers
  private async ensureEmployeeActive(employeeId: string) {
    const exists = await this.employeeRepository.exists(employeeId);
    if (!exists) throw TranslatedException.notFound('vacation.employeeNotFoundOrInactive');
  }

  private ensureValidDate(input: string, key: string): Date {
    const d = new Date(input);
    if (isNaN(d.getTime())) throw TranslatedException.badRequest(key);
    return d;
  }

  private ensureDepartureBeforeOrEqualReturn(dep: Date, ret: Date) {
    if (this.toStartOfDay(dep).getTime() > this.toStartOfDay(ret).getTime()) {
      throw TranslatedException.badRequest('vacation.returnBeforeDeparture');
    }
  }

  private toStartOfDay(d: Date): Date {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  }

  private calculateInclusiveDays(dep: Date, ret: Date): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    const diff = (this.toStartOfDay(ret).getTime() - this.toStartOfDay(dep).getTime()) / msPerDay;
    return Math.floor(diff) + 1;
  }

  private async ensureNoOverlap(
    employeeId: string,
    dep: Date,
    ret: Date,
    excludeId?: string,
  ) {
    const overlaps = await this.vacationRepository.overlapsExists(
      employeeId,
      dep,
      ret,
      excludeId,
    );
    if (overlaps) throw TranslatedException.conflict('vacation.overlapExists');
  }

  private mapToResponseDto(entity: any): VacationResponseDto {
    return {
      id: entity.id,
      employee: {
        id: entity.employee.id,
        name: entity.employee.name,
        companyEmail: entity.employee.companyEmail,
        department: entity.employee.department
          ? { id: entity.employee.department.id, name: entity.employee.department.name }
          : null,
      },
      departureDay: entity.departureDay,
      returnDay: entity.returnDay,
      reason: entity.reason as VacationReason,
      type: entity.type as VacationType,
      numberOfDays: entity.numberOfDays,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}



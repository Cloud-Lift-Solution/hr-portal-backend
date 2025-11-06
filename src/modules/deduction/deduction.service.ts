import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { DeductionType } from '@prisma/client';
import { DeductionRepository } from './repositories/deduction.repository';
import { EmployeeRepository } from '../employee/repositories/employee.repository';
import { TranslatedException } from '../../common/exceptions/business.exception';
import {
  CreateDeductionDto,
  UpdateDeductionDto,
  DeductionResponseDto,
} from './dto';

@Injectable()
export class DeductionService {
  constructor(
    private readonly deductionRepository: DeductionRepository,
    private readonly employeeRepository: EmployeeRepository,
    private readonly i18n: I18nService,
  ) {}

  async findAll(filters?: {
    search?: string;
    month?: string; // YYYY-MM or ISO date
    year?: string; // YYYY
    employeeId?: string;
  }): Promise<DeductionResponseDto[]> {
    const monthNum = filters?.month
      ? this.parseMonth(filters.month)
      : undefined;
    const yearNum = filters?.year ? this.parseYear(filters.year) : undefined;

    const deductions = await this.deductionRepository.findAll({
      search: filters?.search,
      month: monthNum,
      year: yearNum,
      employeeId: filters?.employeeId,
    });

    return deductions.map((d) => this.mapToResponseDto(d));
  }

  async create(
    dto: CreateDeductionDto,
    lang: string,
  ): Promise<DeductionResponseDto> {
    await this.ensureEmployeeActive(dto.employeeId);
    this.validatePayload(dto.type, dto.amount, dto.days, lang);

    const monthDate = this.ensureValidDate(dto.month, lang);

    const created = await this.deductionRepository.create({
      employeeId: dto.employeeId,
      type: dto.type,
      amount: dto.type === DeductionType.MONEY ? dto.amount : undefined,
      days: dto.type === DeductionType.DAYS ? dto.days : undefined,
      month: monthDate,
    });

    return this.mapToResponseDto(created);
  }

  async update(
    id: string,
    dto: UpdateDeductionDto,
    lang: string,
  ): Promise<DeductionResponseDto> {
    const existing = await this.deductionRepository.findById(id);
    if (!existing) throw TranslatedException.notFound('deduction.notFound');

    if (dto.employeeId) await this.ensureEmployeeActive(dto.employeeId);

    const targetType = dto.type ?? existing.type;
    const amount =
      dto.amount ?? (existing.amount ? Number(existing.amount) : null);
    const days = dto.days ?? existing.days ?? null;

    this.validatePayload(
      targetType,
      amount ?? undefined,
      days ?? undefined,
      lang,
    );

    const monthDate = dto.month
      ? this.ensureValidDate(dto.month, lang)
      : undefined;

    const updated = await this.deductionRepository.update(id, {
      employeeId: dto.employeeId,
      type: dto.type,
      amount:
        targetType === DeductionType.MONEY ? (dto.amount ?? amount) : null,
      days: targetType === DeductionType.DAYS ? (dto.days ?? days!) : null,
      month: monthDate,
    });

    return this.mapToResponseDto(updated);
  }

  async remove(id: string, lang: string): Promise<{ message: string }> {
    const existing = await this.deductionRepository.findById(id);
    if (!existing) throw TranslatedException.notFound('deduction.notFound');

    await this.deductionRepository.delete(id);
    return {
      message: await this.i18n.translate('deduction.deleteSuccess', { lang }),
    };
  }

  // Helpers
  private async ensureEmployeeActive(employeeId: string) {
    const exists = await this.employeeRepository.exists(employeeId);
    if (!exists)
      throw TranslatedException.notFound(
        'deduction.employeeNotFoundOrInactive',
      );
  }

  private ensureValidDate(input: string, lang: string): Date {
    const date = new Date(input);
    if (isNaN(date.getTime())) {
      throw TranslatedException.badRequest('deduction.monthInvalid');
    }
    return date;
  }

  private parseMonth(input: string): number | undefined {
    // input can be YYYY-MM or full date
    const d = new Date(input);
    if (!isNaN(d.getTime())) return d.getUTCMonth() + 1;
    const m = /^\d{4}-(\d{2})$/.exec(input)?.[1];
    return m ? parseInt(m, 10) : undefined;
  }

  private parseYear(input: string): number | undefined {
    const y = /^\d{4}$/.exec(input)?.[0];
    return y ? parseInt(y, 10) : undefined;
  }

  private validatePayload(
    type: DeductionType,
    amount?: number,
    days?: number,
    lang?: string,
  ) {
    const hasAmount = amount !== undefined && amount !== null;
    const hasDays = days !== undefined && days !== null;

    if (type === DeductionType.MONEY) {
      if (!hasAmount)
        throw TranslatedException.badRequest('deduction.amountRequired');
      if (hasDays)
        throw TranslatedException.badRequest(
          'deduction.daysMustBeNullForMoney',
        );
      if (amount! <= 0)
        throw TranslatedException.badRequest('deduction.amountPositive');
    }

    if (type === DeductionType.DAYS) {
      if (!hasDays)
        throw TranslatedException.badRequest('deduction.daysRequired');
      if (hasAmount)
        throw TranslatedException.badRequest(
          'deduction.amountMustBeNullForDays',
        );
      if (days! <= 0)
        throw TranslatedException.badRequest('deduction.daysPositive');
    }

    if (!hasAmount && !hasDays)
      throw TranslatedException.badRequest('deduction.amountOrDaysRequired');
    if (hasAmount && hasDays)
      throw TranslatedException.badRequest('deduction.amountAndDaysNotAllowed');
  }

  private mapToResponseDto(entity: any): DeductionResponseDto {
    return {
      id: entity.id,
      type: entity.type,
      amount: entity.amount ? Number(entity.amount) : null,
      days: entity.days ?? null,
      month: entity.month,
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
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

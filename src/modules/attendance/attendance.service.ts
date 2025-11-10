import { Injectable, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { AttendanceStatus } from '@prisma/client';
import { AttendanceRepository } from './repositories/attendance.repository';
import {
  AttendanceResponseDto,
  ClockInResponseDto,
  BreakResponseDto,
  ClockOutResponseDto,
  TodayStatusResponseDto,
  PeriodHoursResponseDto,
  AttendanceListResponseDto,
  MyHistoryResponseDto,
  AttendanceQueryDto,
  MyHistoryQueryDto,
  PeriodHoursQueryDto,
  BreakInfoDto,
} from './dto';
import { TranslatedException } from '../../common/exceptions/business.exception';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Clock in for today
   */
  async clockIn(employeeId: string, lang: string): Promise<ClockInResponseDto> {
    // Verify employee is active
    await this.ensureEmployeeActive(employeeId);

    const today = this.getToday();
    const now = new Date();

    // Check if already clocked in today
    const existing = await this.attendanceRepository.findByEmployeeAndDate(
      employeeId,
      today,
    );

    if (existing) {
      if (existing.status === AttendanceStatus.CLOCKED_IN) {
        throw TranslatedException.badRequest('attendance.alreadyClockedIn');
      }
      if (existing.status === AttendanceStatus.ON_BREAK) {
        throw TranslatedException.badRequest('attendance.alreadyClockedIn');
      }
      if (existing.status === AttendanceStatus.CLOCKED_OUT) {
        throw TranslatedException.badRequest('attendance.alreadyClockedOut');
      }
    }

    // Create attendance record
    const attendance = await this.attendanceRepository.create({
      employeeId,
      date: today,
      clockInTime: now,
      status: AttendanceStatus.CLOCKED_IN,
    });

    return {
      id: attendance.id,
      date: attendance.date,
      clockInTime: attendance.clockInTime,
      status: attendance.status,
      message: await this.i18n.translate('attendance.clockInSuccess', { lang }),
    };
  }

  /**
   * Take a break
   */
  async takeBreak(employeeId: string, lang: string): Promise<BreakResponseDto> {
    const today = this.getToday();
    const now = new Date();

    const attendance = await this.attendanceRepository.findByEmployeeAndDate(
      employeeId,
      today,
    );

    if (!attendance) {
      throw TranslatedException.badRequest('attendance.noClockInFound');
    }

    if (attendance.status === AttendanceStatus.CLOCKED_OUT) {
      throw TranslatedException.badRequest('attendance.alreadyClockedOut');
    }

    if (attendance.status === AttendanceStatus.ON_BREAK) {
      throw TranslatedException.badRequest('attendance.alreadyOnBreak');
    }

    // Check for unclosed breaks
    const activeBreak = await this.attendanceRepository.findActiveBreak(
      attendance.id,
    );
    if (activeBreak) {
      throw TranslatedException.badRequest('attendance.unclosedBreak');
    }

    // Create break record
    const breakRecord = await this.attendanceRepository.createBreak({
      attendanceId: attendance.id,
      breakStart: now,
    });

    // Update attendance status
    await this.attendanceRepository.update(attendance.id, {
      status: AttendanceStatus.ON_BREAK,
    });

    return {
      id: attendance.id,
      date: attendance.date,
      status: AttendanceStatus.ON_BREAK,
      breakStart: breakRecord.breakStart,
      totalBreakMinutes: attendance.totalBreakMinutes,
      message: await this.i18n.translate('attendance.breakStartSuccess', {
        lang,
      }),
    };
  }

  /**
   * Back to work from break
   */
  async backToWork(
    employeeId: string,
    lang: string,
  ): Promise<BreakResponseDto> {
    const today = this.getToday();
    const now = new Date();

    const attendance = await this.attendanceRepository.findByEmployeeAndDate(
      employeeId,
      today,
    );

    if (!attendance) {
      throw TranslatedException.badRequest('attendance.noClockInFound');
    }

    if (attendance.status === AttendanceStatus.CLOCKED_OUT) {
      throw TranslatedException.badRequest('attendance.alreadyClockedOut');
    }

    if (attendance.status === AttendanceStatus.CLOCKED_IN) {
      throw TranslatedException.badRequest('attendance.notOnBreak');
    }

    // Find active break
    const activeBreak = await this.attendanceRepository.findActiveBreak(
      attendance.id,
    );
    if (!activeBreak) {
      throw TranslatedException.badRequest('attendance.notOnBreak');
    }

    // Update break record
    await this.attendanceRepository.updateBreak(activeBreak.id, {
      breakEnd: now,
    });

    // Calculate break duration in minutes
    const breakDuration = Math.round(
      (now.getTime() - activeBreak.breakStart.getTime()) / 60000,
    );

    // Update attendance
    const updated = await this.attendanceRepository.update(attendance.id, {
      status: AttendanceStatus.CLOCKED_IN,
      totalBreakMinutes: attendance.totalBreakMinutes + breakDuration,
    });

    return {
      id: updated.id,
      date: updated.date,
      status: updated.status,
      breakEnd: now,
      breakDuration,
      totalBreakMinutes: updated.totalBreakMinutes,
      message: await this.i18n.translate('attendance.backToWorkSuccess', {
        lang,
      }),
    };
  }

  /**
   * Clock out
   */
  async clockOut(
    employeeId: string,
    lang: string,
  ): Promise<ClockOutResponseDto> {
    const today = this.getToday();
    const now = new Date();

    const attendance = await this.attendanceRepository.findByEmployeeAndDate(
      employeeId,
      today,
    );

    if (!attendance) {
      throw TranslatedException.badRequest('attendance.noClockInFound');
    }

    if (attendance.status === AttendanceStatus.CLOCKED_OUT) {
      throw TranslatedException.badRequest('attendance.alreadyClockedOut');
    }

    if (attendance.status === AttendanceStatus.ON_BREAK) {
      throw TranslatedException.badRequest('attendance.cannotClockOutOnBreak');
    }

    // Check for unclosed breaks
    const activeBreak = await this.attendanceRepository.findActiveBreak(
      attendance.id,
    );
    if (activeBreak) {
      throw TranslatedException.badRequest('attendance.unclosedBreak');
    }

    // Calculate total hours
    const totalHours = this.calculateTotalHours(
      attendance.clockInTime,
      now,
      attendance.totalBreakMinutes,
    );

    // Update attendance
    const updated = await this.attendanceRepository.update(attendance.id, {
      clockOutTime: now,
      totalHours,
      status: AttendanceStatus.CLOCKED_OUT,
    });

    return {
      id: updated.id,
      date: updated.date,
      clockInTime: updated.clockInTime,
      clockOutTime: updated.clockOutTime!,
      totalHours: parseFloat(updated.totalHours!.toString()),
      totalBreakMinutes: updated.totalBreakMinutes,
      breaks: this.mapBreaks(updated.breaks),
      status: updated.status,
      message: await this.i18n.translate('attendance.clockOutSuccess', {
        lang,
      }),
    };
  }

  /**
   * Get today's status
   */
  async getTodayStatus(employeeId: string): Promise<TodayStatusResponseDto> {
    const today = this.getToday();
    const attendance = await this.attendanceRepository.findByEmployeeAndDate(
      employeeId,
      today,
    );

    if (!attendance) {
      return {
        hasRecord: false,
        date: null,
        status: null,
        clockInTime: null,
        clockOutTime: null,
        currentWorkingHours: null,
        totalBreakMinutes: 0,
        breaks: [],
        canClockIn: true,
        canTakeBreak: false,
        canBackToWork: false,
        canClockOut: false,
      };
    }

    const currentWorkingHours =
      attendance.status !== AttendanceStatus.CLOCKED_OUT
        ? this.calculateCurrentWorkingHours(attendance)
        : null;

    return {
      hasRecord: true,
      date: attendance.date.toISOString().split('T')[0],
      status: attendance.status,
      clockInTime: attendance.clockInTime,
      clockOutTime: attendance.clockOutTime,
      currentWorkingHours,
      totalBreakMinutes: attendance.totalBreakMinutes,
      breaks: this.mapBreaks(attendance.breaks),
      canClockIn: false,
      canTakeBreak: attendance.status === AttendanceStatus.CLOCKED_IN,
      canBackToWork: attendance.status === AttendanceStatus.ON_BREAK,
      canClockOut: attendance.status === AttendanceStatus.CLOCKED_IN,
    };
  }

  /**
   * Get total hours for period
   */
  async getTotalHours(
    employeeId: string,
    query: PeriodHoursQueryDto,
    lang: string,
  ): Promise<PeriodHoursResponseDto> {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw TranslatedException.badRequest('attendance.invalidDateRange');
    }

    if (endDate < startDate) {
      throw TranslatedException.badRequest('attendance.invalidDateRange');
    }

    const records = await this.attendanceRepository.getTotalHoursForPeriod(
      employeeId,
      startDate,
      endDate,
    );

    const totalHours = records.reduce((sum, record) => {
      return (
        sum + (record.totalHours ? parseFloat(record.totalHours.toString()) : 0)
      );
    }, 0);

    const daysWorked = records.length;
    const averageHoursPerDay = daysWorked > 0 ? totalHours / daysWorked : 0;

    return {
      period: {
        startDate: query.startDate,
        endDate: query.endDate,
      },
      totalHours: Math.round(totalHours * 100) / 100,
      daysWorked,
      averageHoursPerDay: Math.round(averageHoursPerDay * 100) / 100,
    };
  }

  /**
   * List all attendance records (admin)
   */
  async findAll(query: AttendanceQueryDto): Promise<AttendanceListResponseDto> {
    const month = query.month ? this.parseMonth(query.month) : undefined;
    const year = query.year ? this.parseYear(query.year) : undefined;

    const { data, total } = await this.attendanceRepository.findAll({
      search: query.search,
      employeeId: query.employeeId,
      month,
      year,
      status: query.status,
      page: query.page || 1,
      limit: query.limit || 20,
    });

    const today = this.getToday();

    return {
      data: data.map((record) => this.mapToResponseDto(record, today)),
      pagination: {
        page: query.page || 1,
        limit: query.limit || 20,
        total,
        totalPages: Math.ceil(total / (query.limit || 20)),
      },
    };
  }

  /**
   * Get my attendance history
   */
  async getMyHistory(
    employeeId: string,
    query: MyHistoryQueryDto,
  ): Promise<MyHistoryResponseDto> {
    const filters: any = {
      page: query.page || 1,
      limit: query.limit || 20,
      status: query.status,
    };

    // Handle date filters
    if (query.startDate && query.endDate) {
      filters.startDate = new Date(query.startDate);
      filters.endDate = new Date(query.endDate);

      if (
        isNaN(filters.startDate.getTime()) ||
        isNaN(filters.endDate.getTime())
      ) {
        throw TranslatedException.badRequest('attendance.invalidDateRange');
      }

      if (filters.endDate < filters.startDate) {
        throw TranslatedException.badRequest('attendance.invalidDateRange');
      }
    } else if (query.month) {
      const month = this.parseMonth(query.month);
      const year = query.year
        ? this.parseYear(query.year)
        : new Date().getFullYear();
      filters.month = month;
      filters.year = year;
    } else if (query.year) {
      filters.year = this.parseYear(query.year);
    }

    const { data, total } = await this.attendanceRepository.findByEmployee(
      employeeId,
      filters,
    );

    const today = this.getToday();
    const todayRecord = data.find(
      (record) => record.date.getTime() === today.getTime(),
    );

    // Calculate summary
    const completedRecords = data.filter(
      (r) => r.status === AttendanceStatus.CLOCKED_OUT,
    );
    const totalHours = completedRecords.reduce((sum, record) => {
      return (
        sum + (record.totalHours ? parseFloat(record.totalHours.toString()) : 0)
      );
    }, 0);

    const todayWorkingHours =
      todayRecord && todayRecord.status !== AttendanceStatus.CLOCKED_OUT
        ? this.calculateCurrentWorkingHours(todayRecord)
        : null;

    return {
      data: data.map((record) => this.mapToResponseDto(record, today)),
      summary: {
        totalHours: Math.round(totalHours * 100) / 100,
        totalDays: completedRecords.length,
        todayWorkingHours,
      },
      pagination: {
        page: query.page || 1,
        limit: query.limit || 20,
        total,
        totalPages: Math.ceil(total / (query.limit || 20)),
      },
    };
  }

  // ==================== HELPER METHODS ====================

  private async ensureEmployeeActive(employeeId: string): Promise<void> {
    const isActive =
      await this.attendanceRepository.isEmployeeActive(employeeId);
    if (!isActive) {
      throw TranslatedException.notFound('attendance.employeeNotActive');
    }
  }

  private getToday(): Date {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  }

  private parseMonth(input: string): number | undefined {
    const match = /^\d{4}-(\d{2})$/.exec(input);
    return match ? parseInt(match[1], 10) : undefined;
  }

  private parseYear(input: string): number | undefined {
    const match = /^(\d{4})$/.exec(input);
    return match ? parseInt(match[1], 10) : undefined;
  }

  private calculateTotalHours(
    clockInTime: Date,
    clockOutTime: Date,
    totalBreakMinutes: number,
  ): number {
    const totalMinutes =
      (clockOutTime.getTime() - clockInTime.getTime()) / 60000;
    const workingMinutes = totalMinutes - totalBreakMinutes;
    return Math.round((workingMinutes / 60) * 100) / 100;
  }

  private calculateCurrentWorkingHours(attendance: any): number {
    const now = new Date();
    const elapsedMinutes =
      (now.getTime() - attendance.clockInTime.getTime()) / 60000;

    // Calculate completed breaks
    const completedBreakMinutes = attendance.breaks
      .filter((b: any) => b.breakEnd !== null)
      .reduce((sum: number, b: any) => {
        const duration =
          (b.breakEnd.getTime() - b.breakStart.getTime()) / 60000;
        return sum + duration;
      }, 0);

    // If currently on break, subtract current break time
    let currentBreakMinutes = 0;
    if (attendance.status === AttendanceStatus.ON_BREAK) {
      const activeBreak = attendance.breaks.find(
        (b: any) => b.breakEnd === null,
      );
      if (activeBreak) {
        currentBreakMinutes =
          (now.getTime() - activeBreak.breakStart.getTime()) / 60000;
      }
    }

    const currentWorkingMinutes =
      elapsedMinutes - completedBreakMinutes - currentBreakMinutes;
    return Math.round((currentWorkingMinutes / 60) * 100) / 100;
  }

  private mapBreaks(breaks: any[]): BreakInfoDto[] {
    return breaks.map((breakRecord) => {
      const duration = breakRecord.breakEnd
        ? Math.round(
            (breakRecord.breakEnd.getTime() -
              breakRecord.breakStart.getTime()) /
              60000,
          )
        : null;

      return {
        id: breakRecord.id,
        breakStart: breakRecord.breakStart,
        breakEnd: breakRecord.breakEnd,
        duration,
      };
    });
  }

  private mapToResponseDto(record: any, today: Date): AttendanceResponseDto {
    const isToday = record.date.getTime() === today.getTime();
    const currentWorkingHours =
      isToday && record.status !== AttendanceStatus.CLOCKED_OUT
        ? this.calculateCurrentWorkingHours(record)
        : null;

    return {
      id: record.id,
      date: record.date,
      clockInTime: record.clockInTime,
      clockOutTime: record.clockOutTime,
      totalHours: record.totalHours
        ? parseFloat(record.totalHours.toString())
        : null,
      currentWorkingHours,
      totalBreakMinutes: record.totalBreakMinutes,
      status: record.status,
      breaks: this.mapBreaks(record.breaks),
      isToday,
      employee: record.employee
        ? {
            id: record.employee.id,
            name: record.employee.name,
            companyEmail: record.employee.companyEmail,
            department: record.employee.department,
          }
        : undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}

import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { AttendanceStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { AttendanceRepository } from './repositories/attendance.repository';
import { EmployeeRepository } from '../employee/repositories/employee.repository';
import { TranslatedException } from '../../common/exceptions/business.exception';
import {
  ClockInResponseDto,
  BreakResponseDto,
  ClockOutResponseDto,
  TodayStatusResponseDto,
  AttendanceStatusDto,
  ActiveBreakDto,
} from './dto';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly employeeRepository: EmployeeRepository,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Clock In: Start work day
   */
  async clockIn(
    employeeId: string,
    lang: string,
    locationData?: {
      latitude?: number;
      longitude?: number;
      accuracy?: number;
      address?: string;
    },
  ): Promise<ClockInResponseDto> {
    await this.ensureEmployeeActive(employeeId);

    const today = this.toStartOfDay(new Date());
    const existing = await this.attendanceRepository.findTodayAttendance(employeeId, today);

    if (existing) {
      throw new ConflictException(
        await this.i18n.translate('attendance.alreadyClockedIn', { lang }),
      );
    }

    const clockInTime = new Date();
    const attendance = await this.attendanceRepository.createAttendance(
      employeeId,
      clockInTime,
      today,
      locationData,
    );

    return this.mapToClockInResponse(attendance);
  }

  /**
   * Start Break: Begin break period
   */
  async startBreak(employeeId: string, lang: string): Promise<BreakResponseDto> {
    await this.ensureEmployeeActive(employeeId);

    const today = this.toStartOfDay(new Date());
    const attendance = await this.attendanceRepository.findTodayAttendance(employeeId, today);

    if (!attendance) {
      throw new BadRequestException(
        await this.i18n.translate('attendance.mustClockInFirst', { lang }),
      );
    }

    if (attendance.status === AttendanceStatus.ON_BREAK) {
      throw new BadRequestException(
        await this.i18n.translate('attendance.alreadyOnBreak', { lang }),
      );
    }

    if (attendance.status === AttendanceStatus.CLOCKED_OUT) {
      throw new BadRequestException(
        await this.i18n.translate('attendance.cannotBreakAfterClockOut', { lang }),
      );
    }

    const breakStart = new Date();
    const breakRecord = await this.attendanceRepository.createBreak(attendance.id, breakStart);
    await this.attendanceRepository.updateAttendanceStatus(
      attendance.id,
      AttendanceStatus.ON_BREAK,
    );

    return {
      attendanceId: attendance.id,
      status: AttendanceStatus.ON_BREAK,
      breakStart: breakRecord.breakStart,
    };
  }

  /**
   * End Break: Finish break period
   */
  async endBreak(employeeId: string, lang: string): Promise<BreakResponseDto> {
    await this.ensureEmployeeActive(employeeId);

    const today = this.toStartOfDay(new Date());
    const attendance = await this.attendanceRepository.findTodayAttendance(employeeId, today);

    if (!attendance) {
      throw new BadRequestException(
        await this.i18n.translate('attendance.mustClockInFirst', { lang }),
      );
    }

    if (attendance.status !== AttendanceStatus.ON_BREAK) {
      throw new BadRequestException(
        await this.i18n.translate('attendance.notOnBreak', { lang }),
      );
    }

    const activeBreak = await this.attendanceRepository.findActiveBreak(attendance.id);
    if (!activeBreak) {
      throw new BadRequestException(
        await this.i18n.translate('attendance.noActiveBreak', { lang }),
      );
    }

    const breakDurationMinutes = this.calculateBreakDuration(activeBreak.breakStart);

    const updatedAttendance = await this.attendanceRepository.deleteBreakAndUpdateTotal(
      activeBreak.id,
      attendance.id,
      breakDurationMinutes,
    );

    return {
      attendanceId: attendance.id,
      status: AttendanceStatus.CLOCKED_IN,
      breakDurationMinutes,
      totalBreakMinutes: updatedAttendance.totalBreakMinutes,
    };
  }

  /**
   * Clock Out: End work day
   */
  async clockOut(
    employeeId: string,
    lang: string,
    locationData?: {
      latitude?: number;
      longitude?: number;
      accuracy?: number;
      address?: string;
    },
  ): Promise<ClockOutResponseDto> {
    await this.ensureEmployeeActive(employeeId);

    const today = this.toStartOfDay(new Date());
    const attendance = await this.attendanceRepository.findTodayAttendance(employeeId, today);

    if (!attendance) {
      throw new BadRequestException(
        await this.i18n.translate('attendance.mustClockInFirst', { lang }),
      );
    }

    if (attendance.status === AttendanceStatus.CLOCKED_OUT) {
      throw new BadRequestException(
        await this.i18n.translate('attendance.alreadyClockedOut', { lang }),
      );
    }

    if (attendance.status === AttendanceStatus.ON_BREAK) {
      throw new BadRequestException(
        await this.i18n.translate('attendance.mustEndBreakFirst', { lang }),
      );
    }

    const clockOutTime = new Date();
    const totalHours = this.calculateWorkingHours(
      attendance.clockInTime,
      clockOutTime,
      attendance.totalBreakMinutes,
    );

    const updatedAttendance = await this.attendanceRepository.clockOut(
      attendance.id,
      clockOutTime,
      new Decimal(totalHours),
      locationData,
    );

    return this.mapToClockOutResponse(updatedAttendance);
  }

  /**
   * Get Today Status: View current attendance status
   */
  async getTodayStatus(employeeId: string, lang: string): Promise<TodayStatusResponseDto> {
    await this.ensureEmployeeActive(employeeId);

    const today = this.toStartOfDay(new Date());
    const attendance = await this.attendanceRepository.findTodayAttendance(employeeId, today);

    if (!attendance) {
      return {
        attendance: null,
        activeBreak: null,
      };
    }

    const activeBreak = attendance.breaks?.[0] || null;

    return {
      attendance: this.mapToAttendanceStatusDto(attendance),
      activeBreak: activeBreak ? this.mapToActiveBreakDto(activeBreak) : null,
    };
  }

  // Helper methods

  private async ensureEmployeeActive(employeeId: string): Promise<void> {
    const exists = await this.employeeRepository.exists(employeeId);
    if (!exists) {
      throw TranslatedException.notFound('employee.notFoundOrInactive');
    }
  }

  private toStartOfDay(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  }

  private calculateWorkingHours(
    clockInTime: Date,
    clockOutTime: Date,
    totalBreakMinutes: number,
  ): number {
    const totalWorkMs = clockOutTime.getTime() - clockInTime.getTime();
    const breakMs = totalBreakMinutes * 60 * 1000;
    const netWorkMs = totalWorkMs - breakMs;
    const hours = netWorkMs / (60 * 60 * 1000);
    return Math.max(0, Math.round(hours * 100) / 100);
  }

  private calculateCurrentWorkingHours(clockInTime: Date, totalBreakMinutes: number): number {
    const nowMs = new Date().getTime();
    const elapsedMs = nowMs - clockInTime.getTime();
    const breakMs = totalBreakMinutes * 60 * 1000;
    const netWorkMs = elapsedMs - breakMs;
    const hours = netWorkMs / (60 * 60 * 1000);
    return Math.max(0, Math.round(hours * 100) / 100);
  }

  private calculateBreakDuration(breakStart: Date): number {
    const nowMs = new Date().getTime();
    const durationMs = nowMs - breakStart.getTime();
    return Math.floor(durationMs / (60 * 1000));
  }

  // Mapping methods

  private mapToClockInResponse(attendance: any): ClockInResponseDto {
    return {
      id: attendance.id,
      employeeId: attendance.employeeId,
      date: attendance.date,
      clockInTime: attendance.clockInTime,
      status: attendance.status,
      totalBreakMinutes: attendance.totalBreakMinutes,
      currentWorkingHours: this.calculateCurrentWorkingHours(
        attendance.clockInTime,
        attendance.totalBreakMinutes,
      ),
      clockInLatitude: attendance.clockInLatitude
        ? parseFloat(attendance.clockInLatitude.toString())
        : undefined,
      clockInLongitude: attendance.clockInLongitude
        ? parseFloat(attendance.clockInLongitude.toString())
        : undefined,
      clockInAccuracy: attendance.clockInAccuracy
        ? parseFloat(attendance.clockInAccuracy.toString())
        : undefined,
      clockInAddress: attendance.clockInAddress || undefined,
    };
  }

  private mapToClockOutResponse(attendance: any): ClockOutResponseDto {
    return {
      id: attendance.id,
      employeeId: attendance.employeeId,
      date: attendance.date,
      clockInTime: attendance.clockInTime,
      clockOutTime: attendance.clockOutTime,
      totalBreakMinutes: attendance.totalBreakMinutes,
      totalHours: attendance.totalHours ? parseFloat(attendance.totalHours.toString()) : 0,
      status: attendance.status,
      clockInLatitude: attendance.clockInLatitude
        ? parseFloat(attendance.clockInLatitude.toString())
        : undefined,
      clockInLongitude: attendance.clockInLongitude
        ? parseFloat(attendance.clockInLongitude.toString())
        : undefined,
      clockInAccuracy: attendance.clockInAccuracy
        ? parseFloat(attendance.clockInAccuracy.toString())
        : undefined,
      clockInAddress: attendance.clockInAddress || undefined,
      clockOutLatitude: attendance.clockOutLatitude
        ? parseFloat(attendance.clockOutLatitude.toString())
        : undefined,
      clockOutLongitude: attendance.clockOutLongitude
        ? parseFloat(attendance.clockOutLongitude.toString())
        : undefined,
      clockOutAccuracy: attendance.clockOutAccuracy
        ? parseFloat(attendance.clockOutAccuracy.toString())
        : undefined,
      clockOutAddress: attendance.clockOutAddress || undefined,
    };
  }

  private mapToAttendanceStatusDto(attendance: any): AttendanceStatusDto {
    const currentWorkingHours =
      attendance.status === AttendanceStatus.CLOCKED_IN
        ? this.calculateCurrentWorkingHours(attendance.clockInTime, attendance.totalBreakMinutes)
        : null;

    return {
      id: attendance.id,
      date: attendance.date,
      clockInTime: attendance.clockInTime,
      clockOutTime: attendance.clockOutTime || null,
      totalBreakMinutes: attendance.totalBreakMinutes,
      totalHours: attendance.totalHours ? parseFloat(attendance.totalHours.toString()) : null,
      currentWorkingHours,
      status: attendance.status,
      clockInLatitude: attendance.clockInLatitude
        ? parseFloat(attendance.clockInLatitude.toString())
        : undefined,
      clockInLongitude: attendance.clockInLongitude
        ? parseFloat(attendance.clockInLongitude.toString())
        : undefined,
      clockInAccuracy: attendance.clockInAccuracy
        ? parseFloat(attendance.clockInAccuracy.toString())
        : undefined,
      clockInAddress: attendance.clockInAddress || undefined,
      clockOutLatitude: attendance.clockOutLatitude
        ? parseFloat(attendance.clockOutLatitude.toString())
        : undefined,
      clockOutLongitude: attendance.clockOutLongitude
        ? parseFloat(attendance.clockOutLongitude.toString())
        : undefined,
      clockOutAccuracy: attendance.clockOutAccuracy
        ? parseFloat(attendance.clockOutAccuracy.toString())
        : undefined,
      clockOutAddress: attendance.clockOutAddress || undefined,
    };
  }

  private mapToActiveBreakDto(breakRecord: any): ActiveBreakDto {
    return {
      id: breakRecord.id,
      breakStart: breakRecord.breakStart,
      currentBreakMinutes: this.calculateBreakDuration(breakRecord.breakStart),
    };
  }
}

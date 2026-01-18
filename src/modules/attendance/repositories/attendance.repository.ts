import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AttendanceStatus, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class AttendanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find attendance record for employee on a specific date
   * Includes active break (breakEnd = null) if exists
   */
  async findTodayAttendance(employeeId: string, date: Date) {
    return this.prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date,
        },
      },
      include: {
        breaks: {
          where: {
            breakEnd: null,
          },
        },
      },
    });
  }

  /**
   * Create new attendance record with CLOCKED_IN status
   */
  async createAttendance(
    employeeId: string,
    clockInTime: Date,
    date: Date,
    locationData?: {
      latitude?: number;
      longitude?: number;
      accuracy?: number;
      address?: string;
    },
  ) {
    return this.prisma.attendance.create({
      data: {
        employeeId,
        clockInTime,
        date,
        status: AttendanceStatus.CLOCKED_IN,
        totalBreakMinutes: 0,
        clockInLatitude: locationData?.latitude
          ? new Decimal(locationData.latitude)
          : undefined,
        clockInLongitude: locationData?.longitude
          ? new Decimal(locationData.longitude)
          : undefined,
        clockInAccuracy: locationData?.accuracy
          ? new Decimal(locationData.accuracy)
          : undefined,
        clockInAddress: locationData?.address,
      },
    });
  }

  /**
   * Update attendance status
   */
  async updateAttendanceStatus(attendanceId: string, status: AttendanceStatus) {
    return this.prisma.attendance.update({
      where: { id: attendanceId },
      data: { status },
    });
  }

  /**
   * Clock out: update with clock out time, total hours, and CLOCKED_OUT status
   */
  async clockOut(
    attendanceId: string,
    clockOutTime: Date,
    totalHours: Decimal,
    locationData?: {
      latitude?: number;
      longitude?: number;
      accuracy?: number;
      address?: string;
    },
  ) {
    return this.prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        clockOutTime,
        totalHours,
        status: AttendanceStatus.CLOCKED_OUT,
        clockOutLatitude: locationData?.latitude
          ? new Decimal(locationData.latitude)
          : undefined,
        clockOutLongitude: locationData?.longitude
          ? new Decimal(locationData.longitude)
          : undefined,
        clockOutAccuracy: locationData?.accuracy
          ? new Decimal(locationData.accuracy)
          : undefined,
        clockOutAddress: locationData?.address,
      },
    });
  }

  /**
   * Create temporary break record
   */
  async createBreak(attendanceId: string, breakStart: Date) {
    return this.prisma.attendanceBreak.create({
      data: {
        attendanceId,
        breakStart,
      },
    });
  }

  /**
   * Atomic transaction: Delete break record AND increment totalBreakMinutes
   * This ensures both operations succeed or both fail
   */
  async deleteBreakAndUpdateTotal(
    breakId: string,
    attendanceId: string,
    additionalMinutes: number,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Delete the break record
      await tx.attendanceBreak.delete({
        where: { id: breakId },
      });

      // Increment totalBreakMinutes and update status back to CLOCKED_IN
      return tx.attendance.update({
        where: { id: attendanceId },
        data: {
          totalBreakMinutes: { increment: additionalMinutes },
          status: AttendanceStatus.CLOCKED_IN,
        },
      });
    });
  }

  /**
   * Find active break (breakEnd = null) for attendance record
   */
  async findActiveBreak(attendanceId: string) {
    return this.prisma.attendanceBreak.findFirst({
      where: {
        attendanceId,
        breakEnd: null,
      },
    });
  }

  /**
   * Find all attendance records for an employee with pagination
   */
  async findAllByEmployee(employeeId: string, skip: number, take: number) {
    return this.prisma.attendance.findMany({
      where: {
        employeeId,
      },
      orderBy: {
        date: 'desc',
      },
      skip,
      take,
    });
  }

  /**
   * Count total attendance records for an employee
   */
  async countByEmployee(employeeId: string): Promise<number> {
    return this.prisma.attendance.count({
      where: {
        employeeId,
      },
    });
  }
}

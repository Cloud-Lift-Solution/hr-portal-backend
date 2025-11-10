import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AttendanceStatus, Prisma } from '@prisma/client';

@Injectable()
export class AttendanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeRelations = {
    employee: {
      select: {
        id: true,
        name: true,
        companyEmail: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
    breaks: {
      orderBy: {
        breakStart: 'asc' as const,
      },
    },
  };

  /**
   * Find attendance by employee and date
   */
  async findByEmployeeAndDate(employeeId: string, date: Date) {
    return this.prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date,
        },
      },
      include: this.includeRelations,
    });
  }

  /**
   * Find attendance by ID
   */
  async findById(id: string) {
    return this.prisma.attendance.findUnique({
      where: { id },
      include: this.includeRelations,
    });
  }

  /**
   * Create attendance record
   */
  async create(data: {
    employeeId: string;
    date: Date;
    clockInTime: Date;
    status: AttendanceStatus;
  }) {
    return this.prisma.attendance.create({
      data,
      include: this.includeRelations,
    });
  }

  /**
   * Update attendance record
   */
  async update(
    id: string,
    data: Partial<{
      clockOutTime: Date;
      totalHours: number;
      totalBreakMinutes: number;
      status: AttendanceStatus;
    }>,
  ) {
    return this.prisma.attendance.update({
      where: { id },
      data,
      include: this.includeRelations,
    });
  }

  /**
   * Create break record
   */
  async createBreak(data: { attendanceId: string; breakStart: Date }) {
    return this.prisma.attendanceBreak.create({
      data,
    });
  }

  /**
   * Update break record
   */
  async updateBreak(id: string, data: { breakEnd: Date }) {
    return this.prisma.attendanceBreak.update({
      where: { id },
      data,
    });
  }

  /**
   * Find active break (breakEnd is null)
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
   * Find all attendance records with filters and pagination
   */
  async findAll(filters: {
    search?: string;
    employeeId?: string;
    month?: number;
    year?: number;
    status?: AttendanceStatus;
    page: number;
    limit: number;
  }) {
    const where: Prisma.AttendanceWhereInput = {};

    if (filters.employeeId) {
      where.employeeId = filters.employeeId;
    }

    if (filters.search) {
      where.employee = {
        name: {
          contains: filters.search,
        },
      };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    // Date filtering
    if (filters.month && filters.year) {
      const monthStart = new Date(
        Date.UTC(filters.year, filters.month - 1, 1, 0, 0, 0),
      );
      const monthEnd = new Date(
        Date.UTC(filters.year, filters.month, 0, 23, 59, 59, 999),
      );
      where.date = { gte: monthStart, lte: monthEnd };
    } else if (filters.year) {
      const yearStart = new Date(Date.UTC(filters.year, 0, 1, 0, 0, 0));
      const yearEnd = new Date(Date.UTC(filters.year, 11, 31, 23, 59, 59, 999));
      where.date = { gte: yearStart, lte: yearEnd };
    } else {
      // Default to current month if no date filter provided
      const now = new Date();
      const monthStart = new Date(
        Date.UTC(now.getFullYear(), now.getMonth(), 1, 0, 0, 0),
      );
      const monthEnd = new Date(
        Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
      );
      where.date = { gte: monthStart, lte: monthEnd };
    }

    const [data, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        include: this.includeRelations,
        orderBy: [{ date: 'desc' }, { clockInTime: 'desc' }],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.attendance.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Find attendance records for an employee with filters and pagination
   */
  async findByEmployee(
    employeeId: string,
    filters: {
      startDate?: Date;
      endDate?: Date;
      month?: number;
      year?: number;
      status?: AttendanceStatus;
      page: number;
      limit: number;
    },
  ) {
    const where: Prisma.AttendanceWhereInput = {
      employeeId,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    // Date filtering
    if (filters.startDate && filters.endDate) {
      where.date = { gte: filters.startDate, lte: filters.endDate };
    } else if (filters.month && filters.year) {
      const monthStart = new Date(
        Date.UTC(filters.year, filters.month - 1, 1, 0, 0, 0),
      );
      const monthEnd = new Date(
        Date.UTC(filters.year, filters.month, 0, 23, 59, 59, 999),
      );
      where.date = { gte: monthStart, lte: monthEnd };
    } else if (filters.year) {
      const yearStart = new Date(Date.UTC(filters.year, 0, 1, 0, 0, 0));
      const yearEnd = new Date(Date.UTC(filters.year, 11, 31, 23, 59, 59, 999));
      where.date = { gte: yearStart, lte: yearEnd };
    }

    const [data, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        include: {
          breaks: {
            orderBy: {
              breakStart: 'asc',
            },
          },
        },
        orderBy: [{ date: 'desc' }],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.attendance.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Get total hours for a period
   */
  async getTotalHoursForPeriod(
    employeeId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const records = await this.prisma.attendance.findMany({
      where: {
        employeeId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: AttendanceStatus.CLOCKED_OUT,
      },
      select: {
        totalHours: true,
      },
    });

    return records;
  }

  /**
   * Check if employee exists and is active
   */
  async isEmployeeActive(employeeId: string): Promise<boolean> {
    const count = await this.prisma.employee.count({
      where: {
        id: employeeId,
        status: 'ACTIVE',
      },
    });
    return count > 0;
  }
}

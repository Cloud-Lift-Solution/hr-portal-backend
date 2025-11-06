import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class VacationRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeRelations = {
    employee: {
      select: {
        id: true,
        name: true,
        companyEmail: true,
        department: {
          select: { id: true, name: true },
        },
      },
    },
  };

  async findById(id: string) {
    return this.prisma.vacation.findUnique({ where: { id }, include: this.includeRelations });
  }

  async create(data: {
    employeeId: string;
    departureDay: Date;
    returnDay: Date;
    reason: any;
    type: any;
    numberOfDays: number;
  }) {
    return this.prisma.vacation.create({
      data,
      include: this.includeRelations,
    });
  }

  async update(
    id: string,
    data: Partial<{
      employeeId: string;
      departureDay: Date;
      returnDay: Date;
      reason: any;
      type: any;
      numberOfDays: number;
    }>,
  ) {
    return this.prisma.vacation.update({ where: { id }, data, include: this.includeRelations });
  }

  async delete(id: string) {
    return this.prisma.vacation.delete({ where: { id } });
  }

  async overlapsExists(
    employeeId: string,
    departureDay: Date,
    returnDay: Date,
    excludeId?: string,
  ): Promise<boolean> {
    const count = await this.prisma.vacation.count({
      where: {
        employeeId,
        ...(excludeId && { id: { not: excludeId } }),
        // Overlap condition: existing.return >= new.departure AND existing.departure <= new.return
        returnDay: { gte: departureDay },
        departureDay: { lte: returnDay },
      },
    });
    return count > 0;
  }

  async findAll(filters?: {
    search?: string;
    status?: 'on_vacation' | 'active' | 'history' | 'ended' | 'upcoming';
    employeeId?: string;
    reason?: any;
    type?: any;
    year?: number;
    month?: string; // YYYY-MM or ISO date
  }) {
    const where: Prisma.VacationWhereInput = {};

    if (filters?.employeeId) where.employeeId = filters.employeeId;
    if (filters?.reason) where.reason = filters.reason as any;
    if (filters?.type) where.type = filters.type as any;

    if (filters?.search) {
      where.employee = {
        name: { contains: filters.search, mode: 'insensitive' },
      } as any;
    }

    const now = new Date();
    if (filters?.status) {
      const status = filters.status.toLowerCase();
      if (status === 'on_vacation' || status === 'active') {
        where.AND = [
          { departureDay: { lte: now } },
          { returnDay: { gte: now } },
        ];
      } else if (status === 'history' || status === 'ended') {
        where.returnDay = { lt: now } as any;
      } else if (status === 'upcoming') {
        where.departureDay = { gt: now } as any;
      }
    }

    // Year/Month overlap filters
    if (filters?.year || filters?.month) {
      let start: Date | undefined;
      let end: Date | undefined;

      if (filters.year) {
        start = new Date(Date.UTC(filters.year, 0, 1, 0, 0, 0));
        end = new Date(Date.UTC(filters.year, 11, 31, 23, 59, 59, 999));
      }

      if (filters.month) {
        const d = new Date(filters.month);
        if (!isNaN(d.getTime())) {
          const y = d.getUTCFullYear();
          const m = d.getUTCMonth();
          start = new Date(Date.UTC(y, m, 1, 0, 0, 0));
          end = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999));
        } else {
          const m = /^\d{4}-(\d{2})$/.exec(filters.month)?.[1];
          const y = /^\d{4}/.exec(filters.month)?.[0];
          if (y && m) {
            const yearNum = parseInt(y, 10);
            const monthNum = parseInt(m, 10) - 1;
            start = new Date(Date.UTC(yearNum, monthNum, 1, 0, 0, 0));
            end = new Date(Date.UTC(yearNum, monthNum + 1, 0, 23, 59, 59, 999));
          }
        }
      }

      if (start && end) {
        where.AND = [
          ...(where.AND as any[] | undefined || []),
          { returnDay: { gte: start } },
          { departureDay: { lte: end } },
        ];
      }
    }

    return this.prisma.vacation.findMany({
      where,
      include: this.includeRelations,
      orderBy: [{ departureDay: 'desc' }, { employee: { name: 'asc' } }],
    });
  }
}



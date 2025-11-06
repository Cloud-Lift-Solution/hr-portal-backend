import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SickLeaveRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeRelations = {
    employee: {
      select: {
        id: true,
        name: true,
        companyEmail: true,
        department: { select: { id: true, name: true } },
      },
    },
  };

  async findById(id: string) {
    return this.prisma.sickLeave.findUnique({
      where: { id },
      include: this.includeRelations,
    });
  }

  async create(data: {
    employeeId: string;
    departureDay: Date;
    returnDay: Date;
    reason?: string | null;
    numberOfDays: number;
    attachmentUrl?: string | null;
  }) {
    return this.prisma.sickLeave.create({
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
      reason: string | null;
      numberOfDays: number;
      attachmentUrl: string | null;
    }>,
  ) {
    return this.prisma.sickLeave.update({
      where: { id },
      data,
      include: this.includeRelations,
    });
  }

  async delete(id: string) {
    return this.prisma.sickLeave.delete({ where: { id } });
  }

  async overlapsExists(
    employeeId: string,
    departureDay: Date,
    returnDay: Date,
    excludeId?: string,
  ): Promise<boolean> {
    const count = await this.prisma.sickLeave.count({
      where: {
        employeeId,
        ...(excludeId && { id: { not: excludeId } }),
        returnDay: { gte: departureDay },
        departureDay: { lte: returnDay },
      },
    });
    return count > 0;
  }

  async findAll(filters?: {
    search?: string;
    status?: 'current' | 'active' | 'history' | 'ended' | 'upcoming';
    employeeId?: string;
    year?: number;
    month?: string;
  }) {
    const where: Prisma.SickLeaveWhereInput = {};

    if (filters?.employeeId) where.employeeId = filters.employeeId;

    if (filters?.search) {
      where.employee = {
        name: { contains: filters.search, mode: 'insensitive' },
      } as any;
    }

    const now = new Date();
    if (filters?.status) {
      const status = filters.status.toLowerCase();
      if (status === 'current' || status === 'active') {
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
          ...((where.AND as any[] | undefined) || []),
          { returnDay: { gte: start } },
          { departureDay: { lte: end } },
        ];
      }
    }

    return this.prisma.sickLeave.findMany({
      where,
      include: this.includeRelations,
      orderBy: [{ departureDay: 'desc' }, { employee: { name: 'asc' } }],
    });
  }
}

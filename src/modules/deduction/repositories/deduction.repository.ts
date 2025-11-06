import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { DeductionType, Prisma } from '@prisma/client';

@Injectable()
export class DeductionRepository {
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
  };

  async findById(id: string) {
    return this.prisma.deduction.findUnique({
      where: { id },
      include: this.includeRelations,
    });
  }

  async create(data: {
    employeeId: string;
    type: DeductionType;
    amount?: number;
    days?: number;
    month: Date;
  }) {
    return this.prisma.deduction.create({
      data: {
        employeeId: data.employeeId,
        type: data.type,
        amount: data.amount,
        days: data.days,
        month: data.month,
      },
      include: this.includeRelations,
    });
  }

  async update(
    id: string,
    data: Partial<{
      employeeId: string;
      type: DeductionType;
      amount: number | null;
      days: number | null;
      month: Date;
    }>,
  ) {
    return this.prisma.deduction.update({
      where: { id },
      data,
      include: this.includeRelations,
    });
  }

  async delete(id: string) {
    return this.prisma.deduction.delete({
      where: { id },
    });
  }

  async findAll(filters?: {
    search?: string;
    month?: number; // 1-12
    year?: number;
    employeeId?: string;
  }) {
    const where: Prisma.DeductionWhereInput = {};

    if (filters?.employeeId) {
      where.employeeId = filters.employeeId;
    }

    if (filters?.search) {
      where.employee = {
        name: {
          contains: filters.search,
          mode: 'insensitive',
        },
      } as any;
    }

    // Default to current month/year if not provided
    const now = new Date();
    const year = filters?.year ?? now.getFullYear();
    const month = filters?.month ?? now.getMonth() + 1; // 1-12

    const monthStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const monthEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    where.month = { gte: monthStart, lte: monthEnd } as any;

    return this.prisma.deduction.findMany({
      where,
      include: this.includeRelations,
      orderBy: [{ month: 'desc' }, { employee: { name: 'asc' } }],
    });
  }
}

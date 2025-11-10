import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { LoanType, LoanStatus, Prisma } from '@prisma/client';

@Injectable()
export class LoanRepository {
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

  /**
   * Find loan by ID
   */
  async findById(id: string) {
    return this.prisma.loan.findUnique({
      where: { id },
      include: this.includeRelations,
    });
  }

  /**
   * Create loan
   */
  async create(data: {
    employeeId: string;
    loanAmount: number;
    type: LoanType;
    numberOfInstallments: number;
    numberOfPaymentsMade: number;
    month?: number;
    year?: number;
    paymentStartDate: Date;
    note?: string;
    status: LoanStatus;
  }) {
    return this.prisma.loan.create({
      data,
      include: this.includeRelations,
    });
  }

  /**
   * Update loan
   */
  async update(
    id: string,
    data: Partial<{
      numberOfPaymentsMade: number;
      status: LoanStatus;
    }>,
  ) {
    return this.prisma.loan.update({
      where: { id },
      data,
      include: this.includeRelations,
    });
  }

  /**
   * Find all loans with filters and pagination
   */
  async findAll(filters: {
    search?: string;
    employeeId?: string;
    status?: LoanStatus;
    type?: LoanType;
    page: number;
    limit: number;
  }) {
    const where: Prisma.LoanWhereInput = {};

    if (filters.employeeId) {
      where.employeeId = filters.employeeId;
    }

    if (filters.search) {
      where.employee = {
        name: {
          contains: filters.search,
          mode: 'insensitive',
        },
      };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    const [data, total] = await Promise.all([
      this.prisma.loan.findMany({
        where,
        include: this.includeRelations,
        orderBy: [{ createdAt: 'desc' }],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.loan.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Find loans by employee
   */
  async findByEmployee(
    employeeId: string,
    filters: {
      status?: LoanStatus;
      page: number;
      limit: number;
    },
  ) {
    const where: Prisma.LoanWhereInput = {
      employeeId,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    const [data, total] = await Promise.all([
      this.prisma.loan.findMany({
        where,
        include: this.includeRelations,
        orderBy: [{ createdAt: 'desc' }],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.loan.count({ where }),
    ]);

    return { data, total };
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

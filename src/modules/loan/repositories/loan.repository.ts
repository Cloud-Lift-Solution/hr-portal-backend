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
    purpose: string;
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

  /**
   * Create employee loan request
   */
  async createEmployeeRequest(data: {
    employeeId: string;
    loanAmount: number;
    purpose: string;
    numberOfInstallments: number;
    paymentStartDate: Date;
  }) {
    return this.prisma.loan.create({
      data: {
        employeeId: data.employeeId,
        loanAmount: data.loanAmount,
        purpose: data.purpose,
        type: LoanType.ADD_TO_PAYROLL,
        numberOfInstallments: data.numberOfInstallments,
        numberOfPaymentsMade: 0,
        paymentStartDate: data.paymentStartDate,
        status: LoanStatus.PENDING,
      },
      include: this.includeRelations,
    });
  }

  /**
   * Approve loan and create installments
   */
  async approveLoan(loanId: string, note?: string) {
    const loan = await this.prisma.loan.findUnique({
      where: { id: loanId },
    });

    if (!loan) {
      return null;
    }

    // Calculate installment details
    const installmentAmount = loan.loanAmount.toNumber() / loan.numberOfInstallments;
    const startDate = new Date(loan.paymentStartDate);
    const installments = [];

    for (let i = 0; i < loan.numberOfInstallments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      installments.push({
        loanId: loan.id,
        installmentNumber: i + 1,
        amount: installmentAmount,
        dueMonth: dueDate.getMonth() + 1, // 1-12
        dueYear: dueDate.getFullYear(),
      });
    }

    // Update loan and create installments in a transaction
    return this.prisma.$transaction(async (tx) => {
      // Create all installments
      await tx.loanInstallment.createMany({
        data: installments,
      });

      // Update loan status to ACTIVE
      return tx.loan.update({
        where: { id: loanId },
        data: {
          status: LoanStatus.ACTIVE,
          month: startDate.getMonth() + 1,
          year: startDate.getFullYear(),
          note,
        },
        include: {
          ...this.includeRelations,
          installments: {
            orderBy: {
              installmentNumber: 'asc',
            },
          },
        },
      });
    });
  }

  /**
   * Find loan by ID with installments
   */
  async findByIdWithInstallments(id: string) {
    return this.prisma.loan.findUnique({
      where: { id },
      include: {
        ...this.includeRelations,
        installments: {
          orderBy: {
            installmentNumber: 'asc',
          },
        },
      },
    });
  }

  /**
   * Find active loans for employee with unpaid installments
   */
  async findActiveLoansWithInstallments(employeeId: string) {
    return this.prisma.loan.findMany({
      where: {
        employeeId,
        status: {
          in: [LoanStatus.ACTIVE, LoanStatus.NOT_STARTED],
        },
      },
      include: {
        installments: {
          where: {
            status: 'PENDING',
          },
          orderBy: [
            { dueYear: 'asc' },
            { dueMonth: 'asc' },
          ],
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find completed loans for employee with pagination
   */
  async findCompletedLoans(
    employeeId: string,
    filters: {
      page: number;
      limit: number;
    },
  ) {
    const where: Prisma.LoanWhereInput = {
      employeeId,
      status: LoanStatus.COMPLETED,
    };

    const [data, total] = await Promise.all([
      this.prisma.loan.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.loan.count({ where }),
    ]);

    return { data, total };
  }
}

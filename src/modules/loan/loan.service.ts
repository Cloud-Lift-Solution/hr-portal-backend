import { Injectable, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { LoanType, LoanStatus } from '@prisma/client';
import { LoanRepository } from './repositories/loan.repository';
import {
  CreateLoanDto,
  LoanResponseDto,
  PaymentResponseDto,
  LoanListResponseDto,
  LoanQueryDto,
  MyLoansQueryDto,
} from './dto';
import { TranslatedException } from '../../common/exceptions/business.exception';

@Injectable()
export class LoanService {
  private readonly logger = new Logger(LoanService.name);

  constructor(
    private readonly loanRepository: LoanRepository,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Create new loan
   */
  async create(
    createLoanDto: CreateLoanDto,
    lang: string,
  ): Promise<LoanResponseDto> {
    // Validate employee exists and is active
    await this.ensureEmployeeActive(createLoanDto.employeeId);

    // Validate month/year for ADD_TO_PAYROLL type
    this.validateMonthYear(createLoanDto, lang);

    // Determine initial status based on payment start date
    const paymentStartDate = new Date(createLoanDto.paymentStartDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    paymentStartDate.setHours(0, 0, 0, 0);

    const initialStatus =
      paymentStartDate > today ? LoanStatus.NOT_STARTED : LoanStatus.ACTIVE;

    // Create loan
    const loan = await this.loanRepository.create({
      employeeId: createLoanDto.employeeId,
      loanAmount: createLoanDto.loanAmount,
      type: createLoanDto.type,
      numberOfInstallments: createLoanDto.numberOfInstallments,
      numberOfPaymentsMade: 0,
      month: createLoanDto.month,
      year: createLoanDto.year,
      paymentStartDate,
      note: createLoanDto.note,
      status: initialStatus,
    });

    return this.mapToResponseDto(loan);
  }

  /**
   * Record payment for a loan
   */
  async recordPayment(id: string, lang: string): Promise<PaymentResponseDto> {
    const loan = await this.loanRepository.findById(id);

    if (!loan) {
      throw TranslatedException.notFound('loan.notFound');
    }

    // Validate payment can be made
    if (loan.status === LoanStatus.COMPLETED) {
      throw TranslatedException.badRequest('loan.alreadyCompleted');
    }

    if (loan.numberOfPaymentsMade >= loan.numberOfInstallments) {
      throw TranslatedException.badRequest('loan.cannotOverpay');
    }

    // Increment payments made
    const newPaymentsMade = loan.numberOfPaymentsMade + 1;
    const remainingInstallments = loan.numberOfInstallments - newPaymentsMade;

    // Determine new status
    let newStatus: LoanStatus = loan.status;
    if (loan.status === LoanStatus.NOT_STARTED) {
      newStatus = LoanStatus.ACTIVE;
    }
    if (remainingInstallments === 0) {
      newStatus = LoanStatus.COMPLETED;
    }

    // Update loan
    const updated = await this.loanRepository.update(id, {
      numberOfPaymentsMade: newPaymentsMade,
      status: newStatus,
    });

    const installmentAmount = this.calculateInstallmentAmount(
      parseFloat(updated.loanAmount.toString()),
      updated.numberOfInstallments,
    );

    return {
      id: updated.id,
      numberOfPaymentsMade: updated.numberOfPaymentsMade,
      remainingInstallments,
      installmentAmount,
      status: updated.status,
      message: await this.i18n.translate('loan.paymentRecorded', { lang }),
    };
  }

  /**
   * Get single loan by ID
   */
  async findOne(id: string): Promise<LoanResponseDto> {
    const loan = await this.loanRepository.findById(id);

    if (!loan) {
      throw TranslatedException.notFound('loan.notFound');
    }

    return this.mapToResponseDto(loan);
  }

  /**
   * List all loans with filters
   */
  async findAll(query: LoanQueryDto): Promise<LoanListResponseDto> {
    // Map tab to status
    let status = query.status;
    if (query.tab) {
      status = this.mapTabToStatus(query.tab);
    }

    const { data, total } = await this.loanRepository.findAll({
      search: query.search,
      employeeId: query.employeeId,
      status,
      type: query.type,
      page: query.page || 1,
      limit: query.limit || 20,
    });

    return {
      data: data.map((loan) => this.mapToResponseDto(loan)),
      pagination: {
        page: query.page || 1,
        limit: query.limit || 20,
        total,
        totalPages: Math.ceil(total / (query.limit || 20)),
      },
    };
  }

  /**
   * Get my loans (for logged-in employee)
   */
  async getMyLoans(
    employeeId: string,
    query: MyLoansQueryDto,
  ): Promise<LoanListResponseDto> {
    const { data, total } = await this.loanRepository.findByEmployee(
      employeeId,
      {
        status: query.status,
        page: query.page || 1,
        limit: query.limit || 20,
      },
    );

    return {
      data: data.map((loan) => this.mapToResponseDto(loan)),
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
    const isActive = await this.loanRepository.isEmployeeActive(employeeId);
    if (!isActive) {
      throw TranslatedException.notFound('loan.employeeNotFound');
    }
  }

  private validateMonthYear(createLoanDto: CreateLoanDto, lang: string): void {
    const isPayrollType = createLoanDto.type === LoanType.ADD_TO_PAYROLL;

    if (isPayrollType) {
      // Month and year are required for ADD_TO_PAYROLL
      if (
        createLoanDto.month === undefined ||
        createLoanDto.month === null ||
        createLoanDto.year === undefined ||
        createLoanDto.year === null
      ) {
        throw TranslatedException.badRequest('loan.monthYearRequired');
      }

      // Validate month range
      if (createLoanDto.month < 1 || createLoanDto.month > 12) {
        throw TranslatedException.badRequest('loan.invalidMonth');
      }

      // Validate year
      const currentYear = new Date().getFullYear();
      if (createLoanDto.year < currentYear) {
        throw TranslatedException.badRequest('loan.invalidYear');
      }
    } else {
      // Month and year should NOT be provided for other types
      if (
        createLoanDto.month !== undefined ||
        createLoanDto.year !== undefined
      ) {
        throw TranslatedException.badRequest('loan.monthYearNotAllowed');
      }
    }
  }

  private mapTabToStatus(tab: string): LoanStatus {
    switch (tab) {
      case 'has_loans':
        return LoanStatus.ACTIVE;
      case 'not_started':
        return LoanStatus.NOT_STARTED;
      case 'history':
        return LoanStatus.COMPLETED;
      default:
        return LoanStatus.ACTIVE;
    }
  }

  private calculateInstallmentAmount(
    loanAmount: number,
    numberOfInstallments: number,
  ): number {
    return Math.round((loanAmount / numberOfInstallments) * 100) / 100;
  }

  private calculateRemainingInstallments(
    numberOfInstallments: number,
    numberOfPaymentsMade: number,
  ): number {
    return numberOfInstallments - numberOfPaymentsMade;
  }

  private mapToResponseDto(loan: any): LoanResponseDto {
    const loanAmount = parseFloat(loan.loanAmount.toString());
    const installmentAmount = this.calculateInstallmentAmount(
      loanAmount,
      loan.numberOfInstallments,
    );
    const remainingInstallments = this.calculateRemainingInstallments(
      loan.numberOfInstallments,
      loan.numberOfPaymentsMade,
    );

    return {
      id: loan.id,
      employeeId: loan.employeeId,
      employee: loan.employee
        ? {
            id: loan.employee.id,
            name: loan.employee.name,
            companyEmail: loan.employee.companyEmail,
            department: loan.employee.department,
          }
        : undefined,
      loanAmount,
      type: loan.type,
      numberOfInstallments: loan.numberOfInstallments,
      numberOfPaymentsMade: loan.numberOfPaymentsMade,
      remainingInstallments,
      installmentAmount,
      month: loan.month,
      year: loan.year,
      paymentStartDate: loan.paymentStartDate,
      note: loan.note,
      status: loan.status,
      createdAt: loan.createdAt,
      updatedAt: loan.updatedAt,
    };
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LoanService } from './loan.service';
import {
  CreateLoanDto,
  LoanResponseDto,
  PaymentResponseDto,
  LoanListResponseDto,
  LoanQueryDto,
  ApproveLoanDto,
} from './dto';
import { AcceptLanguage } from '../../common/decorators/accept-language.decorator';

@ApiTags('Admin Loans')
@Controller('admin/loans')
@UseInterceptors(ClassSerializerInterceptor)
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  /**
   * Create new loan (admin creates loan for employee)
   * POST /admin/loans
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new loan for employee' })
  async create(
    @Body() createLoanDto: CreateLoanDto,
    @AcceptLanguage() language: string,
  ): Promise<LoanResponseDto> {
    return await this.loanService.create(createLoanDto, language);
  }

  /**
   * Approve loan and create installments
   * POST /admin/loans/:id/approve
   */
  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve loan and create installments' })
  async approveLoan(
    @Param('id') id: string,
    @Body() dto: ApproveLoanDto,
    @AcceptLanguage() language: string,
  ): Promise<LoanResponseDto> {
    return await this.loanService.approveLoan(id, dto, language);
  }

  /**
   * Record payment for a loan
   * POST /admin/loans/:id/pay
   */
  @Post(':id/pay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record payment for a loan' })
  async recordPayment(
    @Param('id') id: string,
    @AcceptLanguage() language: string,
  ): Promise<PaymentResponseDto> {
    return await this.loanService.recordPayment(id, language);
  }

  /**
   * Get all loans with filters
   * GET /admin/loans
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all loans with filters' })
  async findAll(@Query() query: LoanQueryDto): Promise<LoanListResponseDto> {
    return await this.loanService.findAll(query);
  }

  /**
   * Get single loan by ID
   * GET /admin/loans/:id
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get single loan by ID' })
  async findOne(@Param('id') id: string): Promise<LoanResponseDto> {
    return await this.loanService.findOne(id);
  }
}

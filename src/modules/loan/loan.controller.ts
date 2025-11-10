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
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LoanService } from './loan.service';
import {
  CreateLoanDto,
  LoanResponseDto,
  PaymentResponseDto,
  LoanListResponseDto,
  LoanQueryDto,
  MyLoansQueryDto,
} from './dto';
import { AcceptLanguage } from '../../common/decorators/accept-language.decorator';

@ApiTags('Loans')
// @ApiBearerAuth('JWT-auth') // Uncomment when auth is ready
@Controller('loans')
@UseInterceptors(ClassSerializerInterceptor)
// @UseGuards(JwtAuthGuard) // Uncomment when auth is ready
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  /**
   * Create new loan
   * POST /loans
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new loan' })
  async create(
    @Body() createLoanDto: CreateLoanDto,
    @AcceptLanguage() language: string,
  ): Promise<LoanResponseDto> {
    return await this.loanService.create(createLoanDto, language);
  }

  /**
   * Record payment for a loan
   * POST /loans/:id/pay
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
   * GET /loans
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all loans with filters' })
  async findAll(@Query() query: LoanQueryDto): Promise<LoanListResponseDto> {
    return await this.loanService.findAll(query);
  }

  /**
   * Get my loans (for logged-in employee)
   * GET /loans/my-loans
   */
  @Get('my-loans')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get my loans' })
  async getMyLoans(
    @Request() req: any,
    @Query() query: MyLoansQueryDto,
  ): Promise<LoanListResponseDto> {
    const employeeId = req.user?.id || 'test-employee-id'; // TODO: Get from JWT
    return await this.loanService.getMyLoans(employeeId, query);
  }

  /**
   * Get single loan by ID
   * GET /loans/:id
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get single loan by ID' })
  async findOne(@Param('id') id: string): Promise<LoanResponseDto> {
    return await this.loanService.findOne(id);
  }
}

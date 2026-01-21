import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LoanService } from './loan.service';
import {
  LoanResponseDto,
  MyLoansQueryDto,
  EmployeeLoanRequestDto,
  ActiveLoansResponseDto,
  LoanHistoryResponseDto,
} from './dto';
import { AcceptLanguage } from '../../common/decorators/accept-language.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Employee Loans')
@ApiBearerAuth('JWT-auth')
@Controller('employee/loans')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
export class LoanEmployeeController {
  constructor(private readonly loanService: LoanService) {}

  /**
   * Employee loan request
   * POST /employee/loans/request
   */
  @Post('request')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Request a new loan' })
  async requestLoan(
    @CurrentUser() user: { id: string; email: string },
    @Body() dto: EmployeeLoanRequestDto,
    @AcceptLanguage() language: string,
  ): Promise<LoanResponseDto> {
    return await this.loanService.employeeRequestLoan(user.id, dto, language);
  }

  /**
   * Get active loans with upcoming payments
   * GET /employee/loans/active
   */
  @Get('active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get active loans with upcoming payments' })
  async getActiveLoans(
    @CurrentUser() user: { id: string; email: string },
  ): Promise<ActiveLoansResponseDto> {
    return await this.loanService.getActiveLoans(user.id);
  }

  /**
   * Get loan history (completed/paid loans)
   * GET /employee/loans/history
   */
  @Get('history')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get loan history (completed loans)' })
  async getLoanHistory(
    @CurrentUser() user: { id: string; email: string },
    @Query() query: MyLoansQueryDto,
  ): Promise<LoanHistoryResponseDto> {
    return await this.loanService.getLoanHistory(user.id, query);
  }
}

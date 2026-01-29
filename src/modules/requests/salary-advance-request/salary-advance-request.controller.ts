import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SalaryAdvanceRequestService } from './salary-advance-request.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AcceptLanguage } from '../../../common/decorators/accept-language.decorator';
import {
  CreateSalaryAdvanceRequestDto,
  UpdateSalaryAdvanceStatusDto,
  SalaryAdvanceRequestResponseDto,
} from './dto';

@ApiTags('Salary Advance Requests')
@Controller('requests/salary-advance')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SalaryAdvanceRequestController {
  constructor(
    private readonly salaryAdvanceRequestService: SalaryAdvanceRequestService,
  ) {}

  /**
   * Employee: Submit a salary advance request
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateSalaryAdvanceRequestDto,
  ): Promise<SalaryAdvanceRequestResponseDto> {
    return this.salaryAdvanceRequestService.create(user.id, dto);
  }

  /**
   * Employee: Get my salary advance requests
   */
  @Get('my-requests')
  @HttpCode(HttpStatus.OK)
  async findMyRequests(
    @CurrentUser() user: any,
  ): Promise<SalaryAdvanceRequestResponseDto[]> {
    return this.salaryAdvanceRequestService.findMyRequests(user.id);
  }

  /**
   * Admin: Get all salary advance requests
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<SalaryAdvanceRequestResponseDto[]> {
    return this.salaryAdvanceRequestService.findAll();
  }

  /**
   * Get a specific salary advance request by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id') id: string,
  ): Promise<SalaryAdvanceRequestResponseDto> {
    return this.salaryAdvanceRequestService.findOne(id);
  }

  /**
   * Admin: Update salary advance request status (approve/reject)
   */
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSalaryAdvanceStatusDto,
    @AcceptLanguage() lang: string,
  ): Promise<SalaryAdvanceRequestResponseDto> {
    return this.salaryAdvanceRequestService.updateStatus(id, dto, lang);
  }
}

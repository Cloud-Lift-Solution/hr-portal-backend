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
import { SalaryCertificateRequestService } from './salary-certificate-request.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AcceptLanguage } from '../../../common/decorators/accept-language.decorator';
import {
  CreateSalaryCertificateRequestDto,
  UpdateSalaryCertificateStatusDto,
  SalaryCertificateRequestResponseDto,
} from './dto';

@ApiTags('Salary Certificate Requests')
@Controller('requests/salary-certificate')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SalaryCertificateRequestController {
  constructor(
    private readonly salaryCertificateRequestService: SalaryCertificateRequestService,
  ) {}

  /**
   * Employee: Submit a salary certificate request
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateSalaryCertificateRequestDto,
  ): Promise<SalaryCertificateRequestResponseDto> {
    return this.salaryCertificateRequestService.create(user.id, dto);
  }

  /**
   * Employee: Get my salary certificate requests
   */
  @Get('my-requests')
  @HttpCode(HttpStatus.OK)
  async findMyRequests(
    @CurrentUser() user: any,
  ): Promise<SalaryCertificateRequestResponseDto[]> {
    return this.salaryCertificateRequestService.findMyRequests(user.id);
  }

  /**
   * Admin: Get all salary certificate requests
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<SalaryCertificateRequestResponseDto[]> {
    return this.salaryCertificateRequestService.findAll();
  }

  /**
   * Get a specific salary certificate request by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id') id: string,
  ): Promise<SalaryCertificateRequestResponseDto> {
    return this.salaryCertificateRequestService.findOne(id);
  }

  /**
   * Admin: Update salary certificate request status (approve/reject)
   */
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSalaryCertificateStatusDto,
    @AcceptLanguage() lang: string,
  ): Promise<SalaryCertificateRequestResponseDto> {
    return this.salaryCertificateRequestService.updateStatus(id, dto, lang);
  }
}

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
import { SickLeaveRequestService } from './sick-leave-request.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AcceptLanguage } from '../../../common/decorators/accept-language.decorator';
import {
  CreateSickLeaveRequestDto,
  UpdateSickLeaveStatusDto,
  SickLeaveRequestResponseDto,
} from './dto';

@ApiTags('Sick Leave Requests')
@Controller('requests/sick-leave')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SickLeaveRequestController {
  constructor(
    private readonly sickLeaveRequestService: SickLeaveRequestService,
  ) {}

  /**
   * Employee: Submit a sick leave request
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateSickLeaveRequestDto,
  ): Promise<SickLeaveRequestResponseDto> {
    return this.sickLeaveRequestService.create(user.id, dto);
  }

  /**
   * Admin: Get all sick leave requests
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<SickLeaveRequestResponseDto[]> {
    return this.sickLeaveRequestService.findAll();
  }

  /**
   * Get a specific sick leave request by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<SickLeaveRequestResponseDto> {
    return this.sickLeaveRequestService.findOne(id);
  }

  /**
   * Admin: Update sick leave request status (approve/reject)
   */
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSickLeaveStatusDto,
    @AcceptLanguage() lang: string,
  ): Promise<SickLeaveRequestResponseDto> {
    return this.sickLeaveRequestService.updateStatus(id, dto, lang);
  }
}

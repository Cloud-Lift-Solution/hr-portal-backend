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
import { VacationExtensionRequestService } from './vacation-extension-request.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AcceptLanguage } from '../../../common/decorators/accept-language.decorator';
import {
  CreateVacationExtensionRequestDto,
  UpdateVacationExtensionStatusDto,
  VacationExtensionRequestResponseDto,
} from './dto';

@ApiTags('Vacation Extension Requests')
@Controller('requests/vacation-extension')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VacationExtensionRequestController {
  constructor(
    private readonly vacationExtensionRequestService: VacationExtensionRequestService,
  ) {}

  /**
   * Employee: Submit a vacation extension request
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateVacationExtensionRequestDto,
  ): Promise<VacationExtensionRequestResponseDto> {
    return this.vacationExtensionRequestService.create(user.id, dto);
  }

  /**
   * Admin: Get all vacation extension requests
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<VacationExtensionRequestResponseDto[]> {
    return this.vacationExtensionRequestService.findAll();
  }

  /**
   * Get a specific vacation extension request by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id') id: string,
  ): Promise<VacationExtensionRequestResponseDto> {
    return this.vacationExtensionRequestService.findOne(id);
  }

  /**
   * Admin: Update vacation extension request status (approve/reject)
   */
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateVacationExtensionStatusDto,
    @AcceptLanguage() lang: string,
  ): Promise<VacationExtensionRequestResponseDto> {
    return this.vacationExtensionRequestService.updateStatus(id, dto, lang);
  }
}

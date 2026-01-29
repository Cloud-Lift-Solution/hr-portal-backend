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
import { VacationRequestService } from './vacation-request.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AcceptLanguage } from '../../../common/decorators/accept-language.decorator';
import {
  CreateVacationRequestDto,
  UpdateVacationStatusDto,
  VacationRequestResponseDto,
} from './dto';

@ApiTags('Vacation Requests')
@Controller('requests/vacation')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VacationRequestController {
  constructor(
    private readonly vacationRequestService: VacationRequestService,
  ) {}

  /**
   * Employee: Submit a vacation request
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateVacationRequestDto,
  ): Promise<VacationRequestResponseDto> {
    return this.vacationRequestService.create(user.id, dto);
  }

  /**
   * Admin: Get all vacation requests
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<VacationRequestResponseDto[]> {
    return this.vacationRequestService.findAll();
  }

  /**
   * Get a specific vacation request by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<VacationRequestResponseDto> {
    return this.vacationRequestService.findOne(id);
  }

  /**
   * Admin: Update vacation request status (approve/reject)
   */
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateVacationStatusDto,
    @AcceptLanguage() lang: string,
  ): Promise<VacationRequestResponseDto> {
    return this.vacationRequestService.updateStatus(id, dto, lang);
  }
}

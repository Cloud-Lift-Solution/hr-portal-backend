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
import { VacationCancellationRequestService } from './vacation-cancellation-request.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AcceptLanguage } from '../../../common/decorators/accept-language.decorator';
import {
  CreateVacationCancellationRequestDto,
  UpdateVacationCancellationStatusDto,
  VacationCancellationRequestResponseDto,
} from './dto';

@ApiTags('Vacation Cancellation Requests')
@Controller('requests/vacation-cancellation')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VacationCancellationRequestController {
  constructor(
    private readonly vacationCancellationRequestService: VacationCancellationRequestService,
  ) {}

  /**
   * Employee: Submit a vacation cancellation request
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateVacationCancellationRequestDto,
  ): Promise<VacationCancellationRequestResponseDto> {
    return this.vacationCancellationRequestService.create(user.id, dto);
  }

  /**
   * Employee: Get my vacation cancellation requests
   */
  @Get('my-requests')
  @HttpCode(HttpStatus.OK)
  async findMyRequests(
    @CurrentUser() user: any,
  ): Promise<VacationCancellationRequestResponseDto[]> {
    return this.vacationCancellationRequestService.findMyRequests(user.id);
  }

  /**
   * Admin: Get all vacation cancellation requests
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<VacationCancellationRequestResponseDto[]> {
    return this.vacationCancellationRequestService.findAll();
  }

  /**
   * Get a specific vacation cancellation request by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id') id: string,
  ): Promise<VacationCancellationRequestResponseDto> {
    return this.vacationCancellationRequestService.findOne(id);
  }

  /**
   * Admin: Update vacation cancellation request status (approve/reject)
   */
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateVacationCancellationStatusDto,
    @AcceptLanguage() lang: string,
  ): Promise<VacationCancellationRequestResponseDto> {
    return this.vacationCancellationRequestService.updateStatus(id, dto, lang);
  }
}

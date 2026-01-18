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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SupportTicketService } from './support-ticket.service';
import {
  CreateSupportTicketDto,
  UpdateTicketStatusDto,
  SupportTicketResponseDto,
} from './dto';
import { AcceptLanguage } from '../../common/decorators/accept-language.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Support Tickets')
@ApiBearerAuth('JWT-auth')
@Controller('support-tickets')
@UseGuards(JwtAuthGuard)
export class SupportTicketController {
  constructor(private readonly service: SupportTicketService) {}

  /**
   * Create a new support ticket
   * POST /support-tickets
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new support ticket' })
  async create(
    @CurrentUser() user: { id: string; email: string },
    @Body() dto: CreateSupportTicketDto,
    @AcceptLanguage() lang: string,
  ): Promise<SupportTicketResponseDto> {
    return await this.service.create(user.id, dto, lang);
  }

  /**
   * Get all tickets for the logged-in employee
   * GET /support-tickets
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all support tickets for the logged-in employee' })
  async findMyTickets(
    @CurrentUser() user: { id: string; email: string },
    @AcceptLanguage() lang: string,
  ): Promise<SupportTicketResponseDto[]> {
    return await this.service.findByEmployee(user.id, lang);
  }

  /**
   * Get ticket by ID
   * GET /support-tickets/:id
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get support ticket by ID' })
  async findById(
    @Param('id') id: string,
    @AcceptLanguage() lang: string,
  ): Promise<SupportTicketResponseDto> {
    return await this.service.findById(id, lang);
  }

  /**
   * Update ticket status
   * PATCH /support-tickets/:id/status
   */
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update support ticket status' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTicketStatusDto,
    @AcceptLanguage() lang: string,
  ): Promise<SupportTicketResponseDto> {
    return await this.service.updateStatus(id, dto, lang);
  }
}

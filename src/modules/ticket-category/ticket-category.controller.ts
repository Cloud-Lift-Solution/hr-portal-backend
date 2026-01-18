import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TicketCategoryService } from './ticket-category.service';
import {
  CreateTicketCategoryDto,
  UpdateTicketCategoryDto,
  TicketCategoryResponseDto,
  TicketCategoryDetailResponseDto,
} from './dto';
import { AcceptLanguage } from '../../common/decorators/accept-language.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Ticket Categories')
// @ApiBearerAuth('JWT-auth')
@Controller('ticket-categories')
// @UseGuards(JwtAuthGuard)
export class TicketCategoryController {
  constructor(private readonly service: TicketCategoryService) {}

  /**
   * Create a new ticket category
   * POST /ticket-categories
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new ticket category' })
  async create(
    @Body() dto: CreateTicketCategoryDto,
  ): Promise<TicketCategoryDetailResponseDto> {
    return await this.service.create(dto);
  }

  /**
   * Get all ticket categories (localized)
   * GET /ticket-categories
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all ticket categories (localized)' })
  async findAll(
    @AcceptLanguage() lang: string,
  ): Promise<TicketCategoryResponseDto[]> {
    return await this.service.findAll(lang);
  }

  /**
   * Get all ticket categories with full details
   * GET /ticket-categories/detailed
   */
  @Get('detailed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all ticket categories with all translations' })
  async findAllDetailed(): Promise<TicketCategoryDetailResponseDto[]> {
    return await this.service.findAllDetailed();
  }

  /**
   * Get ticket category by ID
   * GET /ticket-categories/:id
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get ticket category by ID' })
  async findById(
    @Param('id') id: string,
  ): Promise<TicketCategoryDetailResponseDto> {
    return await this.service.findById(id);
  }

  /**
   * Update ticket category
   * PUT /ticket-categories/:id
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update ticket category' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTicketCategoryDto,
  ): Promise<TicketCategoryDetailResponseDto> {
    return await this.service.update(id, dto);
  }

  /**
   * Delete ticket category
   * DELETE /ticket-categories/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete ticket category' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.service.delete(id);
  }
}

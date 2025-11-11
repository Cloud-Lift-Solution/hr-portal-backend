import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { LeadService } from './lead.service';
import { AcceptLanguage } from '../../common/decorators/accept-language.decorator';
import { CreateLeadDto, UpdateLeadDto, LeadQueryDto, LeadResponseDto, PaginatedLeadResponseDto } from './dto';

@ApiTags('Leads')
@Controller('leads')
@UseInterceptors(ClassSerializerInterceptor)
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  /**
   * Get all leads with filters and pagination
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all leads with filters and pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved leads',
    type: PaginatedLeadResponseDto,
  })
  async findAll(@Query() query: LeadQueryDto): Promise<PaginatedLeadResponseDto> {
    return this.leadService.findAll(query);
  }

  /**
   * Get a single lead by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a single lead by ID' })
  @ApiParam({
    name: 'id',
    description: 'Lead ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved lead',
    type: LeadResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Lead not found',
  })
  async findOne(@Param('id') id: string): Promise<LeadResponseDto> {
    return this.leadService.findOne(id);
  }

  /**
   * Create a new lead
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new lead' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Lead successfully created',
    type: LeadResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Lead with this email already exists',
  })
  async create(
    @Body() dto: CreateLeadDto,
    @AcceptLanguage() lang: string,
  ): Promise<LeadResponseDto> {
    return this.leadService.create(dto, lang);
  }

  /**
   * Update an existing lead
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing lead' })
  @ApiParam({
    name: 'id',
    description: 'Lead ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lead successfully updated',
    type: LeadResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Lead not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Lead with this email already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLeadDto,
    @AcceptLanguage() lang: string,
  ): Promise<LeadResponseDto> {
    return this.leadService.update(id, dto, lang);
  }

  /**
   * Delete a lead
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a lead' })
  @ApiParam({
    name: 'id',
    description: 'Lead ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lead successfully deleted',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Lead deleted successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Lead not found',
  })
  async remove(
    @Param('id') id: string,
    @AcceptLanguage() lang: string,
  ): Promise<{ message: string }> {
    return this.leadService.remove(id, lang);
  }
}


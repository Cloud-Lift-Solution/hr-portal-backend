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
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  CompanyResponseDto,
} from './dto';
import {
  PaginatedResult,
  PaginationUtil,
} from '../../common/utils/pagination.util';

@ApiTags('Companies')
@Controller('companies')
@UseInterceptors(ClassSerializerInterceptor)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  /**
   * Create a new company
   * POST /companies
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createCompanyDto: CreateCompanyDto,
  ): Promise<CompanyResponseDto> {
    return await this.companyService.create(createCompanyDto);
  }

  /**
   * Get all companies with pagination
   * GET /companies?page=1&limit=20
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string,
  ): Promise<PaginatedResult<CompanyResponseDto>> {
    const { page, limit } = PaginationUtil.parseParams(pageParam, limitParam);
    return await this.companyService.findAll(page, limit);
  }

  /**
   * Get a single company by ID
   * GET /companies/:id
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<CompanyResponseDto> {
    return await this.companyService.findOne(id);
  }

  /**
   * Update a company
   * PUT /companies/:id
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ): Promise<CompanyResponseDto> {
    return await this.companyService.update(id, updateCompanyDto);
  }

  /**
   * Delete a company
   * DELETE /companies/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.companyService.remove(id);
  }
}

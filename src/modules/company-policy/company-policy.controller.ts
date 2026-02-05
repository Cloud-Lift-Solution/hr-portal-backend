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
import { CompanyPolicyService } from './company-policy.service';
import {
  CreateCompanyPolicyDto,
  UpdateCompanyPolicyDto,
  CompanyPolicyResponseDto,
} from './dto';
import {
  PaginatedResult,
  PaginationUtil,
} from '../../common/utils/pagination.util';

@ApiTags('Company Policies')
@Controller('company-policies')
@UseInterceptors(ClassSerializerInterceptor)
export class CompanyPolicyController {
  constructor(private readonly companyPolicyService: CompanyPolicyService) {}

  /**
   * Create a new company policy
   * POST /company-policies
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateCompanyPolicyDto,
  ): Promise<CompanyPolicyResponseDto> {
    return await this.companyPolicyService.create(createDto);
  }

  /**
   * Get all company policies with pagination
   * GET /company-policies?page=1&limit=20&companyId=xxx&branchId=xxx
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'companyId', required: false, type: String })
  @ApiQuery({ name: 'branchId', required: false, type: String })
  async findAll(
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string,
    @Query('companyId') companyId?: string,
    @Query('branchId') branchId?: string,
  ): Promise<PaginatedResult<CompanyPolicyResponseDto>> {
    const { page, limit } = PaginationUtil.parseParams(pageParam, limitParam);
    return await this.companyPolicyService.findAll(
      page,
      limit,
      companyId,
      branchId,
    );
  }

  /**
   * Get a single company policy by ID
   * GET /company-policies/:id
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<CompanyPolicyResponseDto> {
    return await this.companyPolicyService.findOne(id);
  }

  /**
   * Update a company policy
   * PUT /company-policies/:id
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCompanyPolicyDto,
  ): Promise<CompanyPolicyResponseDto> {
    return await this.companyPolicyService.update(id, updateDto);
  }

  /**
   * Delete a company policy
   * DELETE /company-policies/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.companyPolicyService.remove(id);
  }
}

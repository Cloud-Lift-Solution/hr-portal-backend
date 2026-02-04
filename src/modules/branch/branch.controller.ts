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
import { ApiTags } from '@nestjs/swagger';
import { BranchService } from './branch.service';
import {
  CreateBranchDto,
  UpdateBranchDto,
  BranchResponseDto,
  BranchDetailResponseDto,
} from './dto';
import { AcceptLanguage } from '../../common/decorators/accept-language.decorator';
import {
  PaginatedResult,
  PaginationUtil,
} from '../../common/utils/pagination.util';

@ApiTags('Branches')
// @ApiBearerAuth('JWT-auth') // Commented out for testing - Remove comment to enable JWT auth
@Controller('branches')
@UseInterceptors(ClassSerializerInterceptor)
// @UseGuards(JwtAuthGuard) // Commented out for testing - Remove comment to enable JWT auth
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  /**
   * Get all branches (localized) with pagination
   * GET /branches?page=1&limit=20
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @AcceptLanguage() language: string,
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string,
  ): Promise<PaginatedResult<BranchResponseDto>> {
    const { page, limit } = PaginationUtil.parseParams(pageParam, limitParam);
    return await this.branchService.findAll(language, page, limit);
  }

  /**
   * Get all branches with all translations
   * GET /branches/detailed
   */
  @Get('detailed')
  @HttpCode(HttpStatus.OK)
  async findAllDetailed(): Promise<BranchDetailResponseDto[]> {
    return await this.branchService.findAllDetailed();
  }

  /**
   * Get branches by department ID with pagination
   * GET /branches/by-department/:departmentId?page=1&limit=20
   */
  @Get('by-department/:departmentId')
  @HttpCode(HttpStatus.OK)
  async findByDepartmentId(
    @Param('departmentId') departmentId: string,
    @AcceptLanguage() language: string,
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string,
  ): Promise<PaginatedResult<BranchResponseDto>> {
    const { page, limit } = PaginationUtil.parseParams(pageParam, limitParam);
    return await this.branchService.findByDepartmentId(departmentId, language, page, limit);
  }

  /**
   * Get single branch by ID
   * GET /branches/:id
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<BranchDetailResponseDto> {
    return await this.branchService.findOne(id);
  }

  /**
   * Create new branch
   * POST /branches
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createBranchDto: CreateBranchDto,
    @AcceptLanguage() language: string,
  ): Promise<BranchDetailResponseDto> {
    return await this.branchService.create(createBranchDto, language);
  }

  /**
   * Update existing branch
   * PUT /branches/:id
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateBranchDto: UpdateBranchDto,
    @AcceptLanguage() language: string,
  ): Promise<BranchDetailResponseDto> {
    return await this.branchService.update(id, updateBranchDto, language);
  }

  /**
   * Delete branch
   * DELETE /branches/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @AcceptLanguage() language: string,
  ): Promise<{ message: string }> {
    return await this.branchService.remove(id, language);
  }
}

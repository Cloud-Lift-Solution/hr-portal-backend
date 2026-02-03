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
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DepartmentService } from './department.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  DepartmentResponseDto,
} from './dto';
import { AcceptLanguage } from '../../common/decorators/accept-language.decorator';
import { PaginatedResult } from '../../common/utils/pagination.util';

@ApiTags('Departments')
// @ApiBearerAuth('JWT-auth') // Commented out for testing - Remove comment to enable JWT auth
@Controller('departments')
@UseInterceptors(ClassSerializerInterceptor)
// @UseGuards(JwtAuthGuard) // Commented out for testing - Remove comment to enable JWT auth
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  /**
   * Get all departments with optional search and pagination
   * GET /departments?search=HR&page=1&limit=20
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('search') search?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<PaginatedResult<DepartmentResponseDto>> {
    return await this.departmentService.findAll(search, page, limit);
  }

  /**
   * Get single department by ID
   * GET /departments/:id
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<DepartmentResponseDto> {
    return await this.departmentService.findOne(id);
  }

  /**
   * Create new department
   * POST /departments
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDepartmentDto: CreateDepartmentDto,
    @AcceptLanguage() language: string,
  ): Promise<DepartmentResponseDto> {
    return await this.departmentService.create(createDepartmentDto, language);
  }

  /**
   * Update existing department
   * PUT /departments/:id
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @AcceptLanguage() language: string,
  ): Promise<DepartmentResponseDto> {
    return await this.departmentService.update(
      id,
      updateDepartmentDto,
      language,
    );
  }

  /**
   * Delete department
   * DELETE /departments/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @AcceptLanguage() language: string,
  ): Promise<{ message: string }> {
    return await this.departmentService.remove(id, language);
  }
}

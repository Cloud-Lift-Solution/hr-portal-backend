import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { EmploymentType } from '@prisma/client';
import { EmployeeService } from './employee.service';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  EmployeeResponseDto,
} from './dto';
import { AcceptLanguage } from '../../common/decorators/accept-language.decorator';

@ApiTags('Employees')
// @ApiBearerAuth('JWT-auth') // Commented out for testing - Remove comment to enable JWT auth
@Controller('employees')
@UseInterceptors(ClassSerializerInterceptor)
// @UseGuards(JwtAuthGuard) // Commented out for testing - Remove comment to enable JWT auth
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  /**
   * Get all employees with optional filters
   * GET /employees?search=name&departmentId=uuid&type=FULL_TIME
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, enum: EmploymentType })
  async findAll(
    @Query('search') search?: string,
    @Query('departmentId') departmentId?: string,
    @Query('type') type?: EmploymentType,
  ): Promise<EmployeeResponseDto[]> {
    return await this.employeeService.findAll({
      search,
      departmentId,
      type,
    });
  }

  /**
   * Get single employee by ID
   * GET /employees/:id
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<EmployeeResponseDto> {
    return await this.employeeService.findOne(id);
  }

  /**
   * Create new employee
   * POST /employees
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @AcceptLanguage() language: string,
  ): Promise<EmployeeResponseDto> {
    return await this.employeeService.create(createEmployeeDto, language);
  }

  /**
   * Update existing employee
   * PUT /employees/:id
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @AcceptLanguage() language: string,
  ): Promise<EmployeeResponseDto> {
    return await this.employeeService.update(id, updateEmployeeDto, language);
  }

  /**
   * Soft delete employee
   * DELETE /employees/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @AcceptLanguage() language: string,
  ): Promise<{ message: string }> {
    return await this.employeeService.remove(id, language);
  }

  /**
   * Restore soft-deleted employee
   * PATCH /employees/:id/restore
   */
  @Patch(':id/restore')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id') id: string): Promise<EmployeeResponseDto> {
    return await this.employeeService.restore(id);
  }
}

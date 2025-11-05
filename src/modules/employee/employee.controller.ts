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
import { EmploymentType } from '@prisma/client';
import { EmployeeService } from './employee.service';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  EmployeeResponseDto,
  AssignAssetDto,
  AddAttachmentDto,
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
   * Delete employee
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
   * Assign asset to employee
   * POST /employees/:id/assets
   */
  @Post(':id/assets')
  @HttpCode(HttpStatus.OK)
  async assignAsset(
    @Param('id') id: string,
    @Body() assignAssetDto: AssignAssetDto,
    @AcceptLanguage() language: string,
  ): Promise<{ message: string }> {
    return await this.employeeService.assignAsset(id, assignAssetDto, language);
  }

  /**
   * Unassign asset from employee
   * DELETE /employees/:id/assets/:assetId
   */
  @Delete(':id/assets/:assetId')
  @HttpCode(HttpStatus.OK)
  async unassignAsset(
    @Param('id') id: string,
    @Param('assetId') assetId: string,
    @AcceptLanguage() language: string,
  ): Promise<{ message: string }> {
    return await this.employeeService.unassignAsset(id, assetId, language);
  }

  /**
   * Add attachment to employee
   * POST /employees/:id/attachments
   */
  @Post(':id/attachments')
  @HttpCode(HttpStatus.CREATED)
  async addAttachment(
    @Param('id') id: string,
    @Body() addAttachmentDto: AddAttachmentDto,
    @AcceptLanguage() language: string,
  ): Promise<{ message: string; attachmentId: string }> {
    return await this.employeeService.addAttachment(
      id,
      addAttachmentDto,
      language,
    );
  }

  /**
   * Delete attachment from employee
   * DELETE /employees/:id/attachments/:attachmentId
   */
  @Delete(':id/attachments/:attachmentId')
  @HttpCode(HttpStatus.OK)
  async deleteAttachment(
    @Param('id') id: string,
    @Param('attachmentId') attachmentId: string,
    @AcceptLanguage() language: string,
  ): Promise<{ message: string }> {
    return await this.employeeService.deleteAttachment(
      id,
      attachmentId,
      language,
    );
  }
}


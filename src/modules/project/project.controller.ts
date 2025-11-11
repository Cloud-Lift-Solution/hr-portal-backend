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
import { ProjectService } from './project.service';
import { AcceptLanguage } from '../../common/decorators/accept-language.decorator';
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectQueryDto,
  ProjectResponseDto,
  PaginatedProjectResponseDto,
} from './dto';

@ApiTags('Projects')
@Controller('projects')
@UseInterceptors(ClassSerializerInterceptor)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  /**
   * Get all projects with filters and pagination
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get all projects with filters and pagination',
    description: 'Retrieve a paginated list of projects with optional filters for search, type, month, year, and department',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved projects',
    type: PaginatedProjectResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid query parameters',
  })
  async findAll(@Query() query: ProjectQueryDto): Promise<PaginatedProjectResponseDto> {
    return this.projectService.findAll(query);
  }

  /**
   * Get a single project by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get a single project by ID',
    description: 'Retrieve detailed information about a specific project including calculated payment amounts',
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved project',
    type: ProjectResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found',
  })
  async findOne(@Param('id') id: string): Promise<ProjectResponseDto> {
    return this.projectService.findOne(id);
  }

  /**
   * Create a new project
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new project',
    description: 'Create a new project with client information, contract details, and payment split configuration',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Project successfully created',
    type: ProjectResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or payment percentages do not sum to 100%',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Department not found (if departmentId provided)',
  })
  async create(
    @Body() dto: CreateProjectDto,
    @AcceptLanguage() lang: string,
  ): Promise<ProjectResponseDto> {
    return this.projectService.create(dto, lang);
  }

  /**
   * Update an existing project
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Update an existing project',
    description: 'Update project details. When changing payment method, ensure percentages are updated accordingly',
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Project successfully updated',
    type: ProjectResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project or Department not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or payment percentages do not sum to 100%',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @AcceptLanguage() lang: string,
  ): Promise<ProjectResponseDto> {
    return this.projectService.update(id, dto, lang);
  }

  /**
   * Delete a project
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Delete a project',
    description: 'Permanently delete a project. This action cannot be undone',
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Project successfully deleted',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Project deleted successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found',
  })
  async remove(
    @Param('id') id: string,
    @AcceptLanguage() lang: string,
  ): Promise<{ message: string }> {
    return this.projectService.remove(id, lang);
  }
}


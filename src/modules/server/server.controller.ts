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
import { ServerService } from './server.service';
import { AcceptLanguage } from '../../common/decorators/accept-language.decorator';
import {
  CreateServerDto,
  UpdateServerDto,
  ServerQueryDto,
  ServerResponseDto,
  PaginatedServerResponseDto,
} from './dto';

@ApiTags('Servers')
@Controller('servers')
@UseInterceptors(ClassSerializerInterceptor)
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

  /**
   * Get all servers with filters and pagination
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all servers with filters and pagination',
    description: 'Retrieve a paginated list of servers with optional filters for search, project, status, and date ranges',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved servers',
    type: PaginatedServerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid query parameters',
  })
  async findAll(@Query() query: ServerQueryDto): Promise<PaginatedServerResponseDto> {
    return this.serverService.findAll(query);
  }

  /**
   * Get a single server by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a single server by ID',
    description: 'Retrieve detailed information about a specific server including calculated fields (duration, active status)',
  })
  @ApiParam({
    name: 'id',
    description: 'Server ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved server',
    type: ServerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Server not found',
  })
  async findOne(@Param('id') id: string): Promise<ServerResponseDto> {
    return this.serverService.findOne(id);
  }

  /**
   * Create a new server
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new server',
    description: 'Create a new server with contract details and service period',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Server successfully created',
    type: ServerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or end date is before start date',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found',
  })
  async create(
    @Body() dto: CreateServerDto,
    @AcceptLanguage() lang: string,
  ): Promise<ServerResponseDto> {
    return this.serverService.create(dto, lang);
  }

  /**
   * Update an existing server
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update an existing server',
    description: 'Update server details. All fields are optional',
  })
  @ApiParam({
    name: 'id',
    description: 'Server ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Server successfully updated',
    type: ServerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Server or Project not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or end date is before start date',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateServerDto,
    @AcceptLanguage() lang: string,
  ): Promise<ServerResponseDto> {
    return this.serverService.update(id, dto, lang);
  }

  /**
   * Delete a server
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a server',
    description: 'Permanently delete a server. This action cannot be undone',
  })
  @ApiParam({
    name: 'id',
    description: 'Server ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Server successfully deleted',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Server deleted successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Server not found',
  })
  async remove(
    @Param('id') id: string,
    @AcceptLanguage() lang: string,
  ): Promise<{ message: string }> {
    return this.serverService.remove(id, lang);
  }
}


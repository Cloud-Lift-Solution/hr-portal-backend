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
import { OrganizationService } from './organization.service';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  OrganizationResponseDto,
  OrganizationListResponseDto,
  DeleteOrganizationResponseDto,
  OrganizationQueryDto,
} from './dto';
import { AcceptLanguage } from '../../common/decorators/accept-language.decorator';

@ApiTags('Organizations')
// @ApiBearerAuth('JWT-auth') // Uncomment when auth is ready
@Controller('organizations')
@UseInterceptors(ClassSerializerInterceptor)
// @UseGuards(JwtAuthGuard) // Uncomment when auth is ready
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  /**
   * Create new organization
   * POST /organizations
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create new organization',
    description:
      'Create an organization with primary name and optional additional names with attachments',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Organization created successfully',
    type: OrganizationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Organization name already exists',
  })
  async create(
    @Body() createDto: CreateOrganizationDto,
    @AcceptLanguage() language: string,
  ): Promise<OrganizationResponseDto> {
    return await this.organizationService.create(createDto, language);
  }

  /**
   * Update organization
   * PUT /organizations/:id
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update organization',
    description:
      'Update organization primary name and/or replace all additional names',
  })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Organization updated successfully',
    type: OrganizationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Organization not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error or no fields provided',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Organization name already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateOrganizationDto,
    @AcceptLanguage() language: string,
  ): Promise<OrganizationResponseDto> {
    return await this.organizationService.update(id, updateDto, language);
  }

  /**
   * Delete organization
   * DELETE /organizations/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete organization',
    description: 'Delete organization and all its additional names',
  })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Organization deleted successfully',
    type: DeleteOrganizationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Organization not found',
  })
  async delete(
    @Param('id') id: string,
    @AcceptLanguage() language: string,
  ): Promise<DeleteOrganizationResponseDto> {
    return await this.organizationService.delete(id, language);
  }

  /**
   * Get all organizations with filters
   * GET /organizations
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all organizations',
    description:
      'List organizations with pagination, search, and sorting. Search works on primary and additional names.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of organizations',
    type: OrganizationListResponseDto,
  })
  async findAll(
    @Query() query: OrganizationQueryDto,
  ): Promise<OrganizationListResponseDto> {
    return await this.organizationService.findAll(query);
  }

  /**
   * Get single organization by ID
   * GET /organizations/:id
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get single organization',
    description: 'Get organization details with all additional names',
  })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Organization details',
    type: OrganizationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Organization not found',
  })
  async findOne(@Param('id') id: string): Promise<OrganizationResponseDto> {
    return await this.organizationService.findOne(id);
  }
}


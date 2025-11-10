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
import { AllowanceService } from './allowance.service';
import {
  CreateAllowanceDto,
  UpdateAllowanceDto,
  AllowanceResponseDto,
  AllowanceListResponseDto,
  DeleteAllowanceResponseDto,
  AllowanceQueryDto,
} from './dto';
import { AcceptLanguage } from '../../common/decorators/accept-language.decorator';

@ApiTags('Allowances')
// @ApiBearerAuth('JWT-auth') // Uncomment when auth is ready
@Controller('allowances')
@UseInterceptors(ClassSerializerInterceptor)
// @UseGuards(JwtAuthGuard) // Uncomment when auth is ready
export class AllowanceController {
  constructor(private readonly allowanceService: AllowanceService) {}

  /**
   * Create new allowance
   * POST /allowances
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new allowance' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Allowance created successfully',
    type: AllowanceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error or allowance name already exists',
  })
  async create(
    @Body() createAllowanceDto: CreateAllowanceDto,
    @AcceptLanguage() language: string,
  ): Promise<AllowanceResponseDto> {
    return await this.allowanceService.create(createAllowanceDto, language);
  }

  /**
   * Update allowance
   * PUT /allowances/:id
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update allowance' })
  @ApiParam({ name: 'id', description: 'Allowance ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Allowance updated successfully',
    type: AllowanceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Allowance not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Validation error, allowance name already exists, or no fields provided',
  })
  async update(
    @Param('id') id: string,
    @Body() updateAllowanceDto: UpdateAllowanceDto,
    @AcceptLanguage() language: string,
  ): Promise<AllowanceResponseDto> {
    return await this.allowanceService.update(id, updateAllowanceDto, language);
  }

  /**
   * Delete allowance
   * DELETE /allowances/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete allowance' })
  @ApiParam({ name: 'id', description: 'Allowance ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Allowance deleted successfully',
    type: DeleteAllowanceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Allowance not found',
  })
  async delete(
    @Param('id') id: string,
    @AcceptLanguage() language: string,
  ): Promise<DeleteAllowanceResponseDto> {
    return await this.allowanceService.delete(id, language);
  }

  /**
   * Get all allowances with filters
   * GET /allowances
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all allowances with filters and pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of allowances',
    type: AllowanceListResponseDto,
  })
  async findAll(
    @Query() query: AllowanceQueryDto,
  ): Promise<AllowanceListResponseDto> {
    return await this.allowanceService.findAll(query);
  }

  /**
   * Get single allowance by ID
   * GET /allowances/:id
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get single allowance by ID' })
  @ApiParam({ name: 'id', description: 'Allowance ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Allowance details',
    type: AllowanceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Allowance not found',
  })
  async findOne(@Param('id') id: string): Promise<AllowanceResponseDto> {
    return await this.allowanceService.findOne(id);
  }
}

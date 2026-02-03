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
import { WorkShiftService } from './work-shift.service';
import {
  CreateWorkShiftDto,
  UpdateWorkShiftDto,
  WorkShiftResponseDto,
} from './dto';
import { AcceptLanguage } from '../../common/decorators/accept-language.decorator';

@ApiTags('Work Shifts')
// @ApiBearerAuth('JWT-auth') // Commented out for testing - Remove comment to enable JWT auth
@Controller('work-shifts')
@UseInterceptors(ClassSerializerInterceptor)
// @UseGuards(JwtAuthGuard) // Commented out for testing - Remove comment to enable JWT auth
export class WorkShiftController {
  constructor(private readonly workShiftService: WorkShiftService) {}

  /**
   * Get all work shifts with optional search
   * GET /work-shifts?search=Morning
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('search') search?: string,
  ): Promise<WorkShiftResponseDto[]> {
    return await this.workShiftService.findAll(search);
  }

  /**
   * Get single work shift by ID
   * GET /work-shifts/:id
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<WorkShiftResponseDto> {
    return await this.workShiftService.findOne(id);
  }

  /**
   * Create new work shift
   * POST /work-shifts
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createWorkShiftDto: CreateWorkShiftDto,
    @AcceptLanguage() language: string,
  ): Promise<WorkShiftResponseDto> {
    return await this.workShiftService.create(createWorkShiftDto, language);
  }

  /**
   * Update existing work shift
   * PUT /work-shifts/:id
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateWorkShiftDto: UpdateWorkShiftDto,
    @AcceptLanguage() language: string,
  ): Promise<WorkShiftResponseDto> {
    return await this.workShiftService.update(id, updateWorkShiftDto, language);
  }

  /**
   * Delete work shift
   * DELETE /work-shifts/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @AcceptLanguage() language: string,
  ): Promise<{ message: string }> {
    return await this.workShiftService.remove(id, language);
  }
}

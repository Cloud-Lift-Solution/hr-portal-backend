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
import { AcceptLanguage } from '../../common/decorators/accept-language.decorator';
import { SickLeaveService } from './sick-leave.service';
import {
  CreateSickLeaveDto,
  UpdateSickLeaveDto,
  SickLeaveQueryDto,
  SickLeaveResponseDto,
} from './dto';

@ApiTags('Sick Leaves')
@Controller('sick-leaves')
@UseInterceptors(ClassSerializerInterceptor)
export class SickLeaveController {
  constructor(private readonly sickLeaveService: SickLeaveService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: SickLeaveQueryDto,
  ): Promise<SickLeaveResponseDto[]> {
    return this.sickLeaveService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<SickLeaveResponseDto> {
    return this.sickLeaveService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateSickLeaveDto,
    @AcceptLanguage() lang: string,
  ): Promise<SickLeaveResponseDto> {
    return this.sickLeaveService.create(dto, lang);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSickLeaveDto,
    @AcceptLanguage() lang: string,
  ): Promise<SickLeaveResponseDto> {
    return this.sickLeaveService.update(id, dto, lang);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @AcceptLanguage() lang: string,
  ): Promise<{ message: string }> {
    return this.sickLeaveService.remove(id, lang);
  }
}

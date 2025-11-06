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
import { VacationService } from './vacation.service';
import { AcceptLanguage } from '../../common/decorators/accept-language.decorator';
import { CreateVacationDto, UpdateVacationDto, VacationQueryDto, VacationResponseDto } from './dto';

@ApiTags('Vacations')
@Controller('vacations')
@UseInterceptors(ClassSerializerInterceptor)
export class VacationController {
  constructor(private readonly vacationService: VacationService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: VacationQueryDto): Promise<VacationResponseDto[]> {
    return this.vacationService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<VacationResponseDto> {
    return this.vacationService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateVacationDto,
    @AcceptLanguage() lang: string,
  ): Promise<VacationResponseDto> {
    return this.vacationService.create(dto, lang);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateVacationDto,
    @AcceptLanguage() lang: string,
  ): Promise<VacationResponseDto> {
    return this.vacationService.update(id, dto, lang);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @AcceptLanguage() lang: string,
  ): Promise<{ message: string }> {
    return this.vacationService.remove(id, lang);
  }
}



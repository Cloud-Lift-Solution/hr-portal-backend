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
import { DeductionService } from './deduction.service';
import { AcceptLanguage } from '../../common/decorators/accept-language.decorator';
import {
  CreateDeductionDto,
  UpdateDeductionDto,
  DeductionResponseDto,
  DeductionQueryDto,
} from './dto';

@ApiTags('Deductions')
@Controller('deductions')
@UseInterceptors(ClassSerializerInterceptor)
export class DeductionController {
  constructor(private readonly deductionService: DeductionService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: DeductionQueryDto,
  ): Promise<DeductionResponseDto[]> {
    return this.deductionService.findAll(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateDeductionDto,
    @AcceptLanguage() lang: string,
  ): Promise<DeductionResponseDto> {
    return this.deductionService.create(dto, lang);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDeductionDto,
    @AcceptLanguage() lang: string,
  ): Promise<DeductionResponseDto> {
    return this.deductionService.update(id, dto, lang);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @AcceptLanguage() lang: string,
  ): Promise<{ message: string }> {
    return this.deductionService.remove(id, lang);
  }
}

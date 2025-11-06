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
import { DeductionService } from './deduction.service';
import { CreateDeductionDto } from './dto/create-deduction.dto';
import { UpdateDeductionDto } from './dto/update-deduction.dto';
import { DeductionResponseDto } from './dto/deduction-response.dto';
import { AcceptLanguage } from '../../common/decorators/accept-language.decorator';

@ApiTags('Deductions')
@Controller('deductions')
@UseInterceptors(ClassSerializerInterceptor)
export class DeductionController {
  constructor(private readonly deductionService: DeductionService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'month', required: false, type: String })
  @ApiQuery({ name: 'year', required: false, type: String })
  @ApiQuery({ name: 'employeeId', required: false, type: String })
  async findAll(
    @Query('search') search?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('employeeId') employeeId?: string,
  ): Promise<DeductionResponseDto[]> {
    return this.deductionService.findAll({ search, month, year, employeeId });
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

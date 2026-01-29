import {
  Controller,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UnifiedRequestsService } from './unified-requests.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginatedUnifiedRequestsDto } from './dto';

@ApiTags('Unified Requests')
@Controller('requests')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UnifiedRequestsController {
  constructor(
    private readonly unifiedRequestsService: UnifiedRequestsService,
  ) {}

  /**
   * Employee: Get all my requests (all types) with pagination
   */
  @Get('my-requests')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMyRequests(
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<PaginatedUnifiedRequestsDto> {
    return this.unifiedRequestsService.getMyRequests(user.id, page, limit);
  }
}

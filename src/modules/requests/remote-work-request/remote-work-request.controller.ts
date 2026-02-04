import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RemoteWorkRequestService } from './remote-work-request.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AcceptLanguage } from '../../../common/decorators/accept-language.decorator';
import {
  CreateRemoteWorkRequestDto,
  UpdateRemoteWorkStatusDto,
  RemoteWorkRequestResponseDto,
} from './dto';

@ApiTags('Remote Work Requests')
@Controller('requests/remote-work')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RemoteWorkRequestController {
  constructor(
    private readonly remoteWorkRequestService: RemoteWorkRequestService,
  ) {}

  /**
   * Employee: Submit a remote work request
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateRemoteWorkRequestDto,
  ): Promise<RemoteWorkRequestResponseDto> {
    return this.remoteWorkRequestService.create(user.id, dto);
  }

  /**
   * Admin: Get all remote work requests
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<RemoteWorkRequestResponseDto[]> {
    return this.remoteWorkRequestService.findAll();
  }

  /**
   * Get a specific remote work request by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id') id: string,
  ): Promise<RemoteWorkRequestResponseDto> {
    return this.remoteWorkRequestService.findOne(id);
  }

  /**
   * Admin: Update remote work request status (approve/reject)
   */
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateRemoteWorkStatusDto,
    @AcceptLanguage() lang: string,
  ): Promise<RemoteWorkRequestResponseDto> {
    return this.remoteWorkRequestService.updateStatus(id, dto, lang);
  }
}

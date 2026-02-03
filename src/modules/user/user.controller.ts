import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserProfileResponseDto, EmployeeAssetResponseDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResult } from '../../common/utils/pagination.util';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Get current employee profile
   */
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getUserProfile(
    @CurrentUser() user: { id: string; email: string },
  ): Promise<UserProfileResponseDto> {
    return await this.userService.getUserProfile(user.id);
  }

  /**
   * Get assets assigned to the logged-in employee
   * GET /user/assets?page=1&limit=20
   */
  @Get('assets')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMyAssets(
    @CurrentUser() user: { id: string; email: string },
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<PaginatedResult<EmployeeAssetResponseDto>> {
    return await this.userService.getMyAssets(user.id, page, limit);
  }
}

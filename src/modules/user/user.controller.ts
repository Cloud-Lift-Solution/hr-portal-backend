import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserProfileResponseDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

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
}

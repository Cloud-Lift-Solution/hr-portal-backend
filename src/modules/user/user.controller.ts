import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  Put,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserProfileResponseDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AcceptLanguage } from '../../common/decorators/accept-language.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

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
   * Update current user profile
   */
  @Put('profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @CurrentUser() user: { id: string; email: string },
    @Body() updateProfileDto: UpdateProfileDto,
    @AcceptLanguage() language: string,
  ): Promise<{ message: string }> {
    return await this.userService.updateProfile(
      user.id,
      updateProfileDto,
      language,
    );
  }
}

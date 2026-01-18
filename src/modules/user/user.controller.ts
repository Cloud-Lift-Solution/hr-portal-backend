import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  // UseGuards,
  Put,
  Body,
} from '@nestjs/common';
import { ApiTags /* ApiBearerAuth */ } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserProfileResponseDto } from './dto';
// import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AcceptLanguage } from '../../common/decorators/accept-language.decorator';
import { S3SignedUrlInterceptor } from '../../common/interceptors/s3-signed-url.interceptor';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('Users')
// @ApiBearerAuth('JWT-auth') // Commented out for testing - Remove comment to enable JWT auth
@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
// @UseGuards(JwtAuthGuard) // Commented out for testing - Remove comment to enable JWT auth
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Get current user profile with localized content
   * S3 file keys (cvFileKey, portfolioFileKey) are automatically transformed to signed URLs
   *
   * ⚠️ NOTE: This endpoint uses @CurrentUser() which requires JWT authentication.
   * It may not work properly with auth disabled.
   */
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(S3SignedUrlInterceptor)
  async getUserProfile(
    @CurrentUser() user: { id: string; email: string },
    @AcceptLanguage() language: string,
  ): Promise<UserProfileResponseDto> {
    return await this.userService.getUserProfile(user.id, language);
  }

  /**
   * Update current user profile
   *
   * ⚠️ NOTE: This endpoint uses @CurrentUser() which requires JWT authentication.
   * It may not work properly with auth disabled.
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

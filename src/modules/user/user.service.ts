import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { UserProfileMapper } from './mappers/get-user-profile.mapper';
import { TranslatedException } from 'src/common/exceptions/business.exception';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { I18nService } from 'nestjs-i18n';
import { hashPassword } from 'src/utils/auth/password.utility';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Get user profile by ID
   */
  async getUserProfile(
    userId: string,
    languageCode: string,
  ): Promise<UserProfileResponseDto> {
    try {
      // Fetch user with all required relations
      const user = await this.fetchUserWithRelations(userId, languageCode);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Map to DTO using mapper
      return UserProfileMapper.toUserProfileDto(user);
    } catch (error) {
      throw new Error('Failed to fetch user profile');
    }
  }

  /**
   * Fetch user with all required relations and translations
   */
  private async fetchUserWithRelations(userId: string, languageCode: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        yearsOfExperience: true,
        cvFileKey: true,
        portfolioFileKey: true,
        age: true,
        gender: true,
        preferredLanguage: true,
        sessionDuration: true,
        challengeLevel: true,
        createdAt: true,
        updatedAt: true,
        workField: {
          select: {
            id: true,
            translations: {
              where: {
                language: {
                  code: languageCode,
                },
              },
              select: { name: true },
            },
          },
        },
        jobTitle: {
          select: {
            id: true,
            translations: {
              where: {
                language: {
                  code: languageCode,
                },
              },
              select: { name: true },
            },
          },
        },
      },
    });
  }

  async updateProfile(
    userId: string,
    updateData: UpdateProfileDto,
    lang: string,
  ): Promise<{ message: string }> {
    try {
      // Check if user exists
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        throw TranslatedException.notFound('user.profile.notFound');
      }

      // Prepare update data
      const dataToUpdate: any = {
        name: updateData.name,
        age: updateData.age,
      };

      // Hash password if provided
      if (updateData.password) {
        dataToUpdate.password = await hashPassword(updateData.password);
      }

      // Update user
      await this.prisma.user.update({
        where: { id: userId },
        data: dataToUpdate,
      });

      return {
        message: await this.i18n.translate('user.profile.updateSuccess', {
          lang,
        }),
      };
    } catch (error) {
      throw TranslatedException.internalError('user.profile.updateFailed');
    }
  }
}

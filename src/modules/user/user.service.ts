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
   * Get employee profile by ID
   */
  async getUserProfile(employeeId: string): Promise<UserProfileResponseDto> {
    try {
      // Fetch employee with all required relations
      const employee = await this.fetchEmployeeWithRelations(employeeId);

      if (!employee) {
        throw new NotFoundException('Employee not found');
      }

      // Map to DTO using mapper
      return UserProfileMapper.toUserProfileDto(employee);
    } catch (error) {
      this.logger.error(
        `Failed to fetch employee profile for employeeId: ${employeeId}`,
        error,
      );

      // Re-throw NotFoundException as-is
      if (error instanceof NotFoundException) {
        throw error;
      }

      // Re-throw other errors with more context
      throw error;
    }
  }

  /**
   * Fetch employee with all required relations
   */
  private async fetchEmployeeWithRelations(employeeId: string) {
    return this.prisma.employee.findUnique({
      where: { id: employeeId, status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        civilId: true,
        civilIdExpiryDate: true,
        passportNo: true,
        passportExpiryDate: true,
        nationality: true,
        jobTitle: true,
        startDate: true,
        type: true,
        salary: true,
        iban: true,
        personalEmail: true,
        companyEmail: true,
        status: true,
        totalVacationDays: true,
        usedVacationDays: true,
        department: {
          select: {
            id: true,
            name: true,
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

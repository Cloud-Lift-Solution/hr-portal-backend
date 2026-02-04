import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { EmployeeAssetResponseDto } from './dto/employee-asset-response.dto';
import { TeamMemberResponseDto } from './dto/team-member-response.dto';
import { UserProfileMapper } from './mappers/get-user-profile.mapper';
import { TranslatedException } from 'src/common/exceptions/business.exception';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { I18nService } from 'nestjs-i18n';
import { hashPassword } from 'src/utils/auth/password.utility';
import {
  PaginatedResult,
  PaginationUtil,
} from '../../common/utils/pagination.util';

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
        branch: {
          select: {
            id: true,
            translations: {
              select: {
                name: true,
              },
            },
            department: {
              select: {
                id: true,
                name: true,
              },
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

  /**
   * Get assets assigned to the logged-in employee with pagination
   */
  async getMyAssets(
    employeeId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<EmployeeAssetResponseDto>> {
    try {
      // Normalize pagination parameters
      const normalizedPage = PaginationUtil.normalizePage(page);
      const normalizedLimit = PaginationUtil.normalizeLimit(limit);

      // Calculate skip
      const skip = PaginationUtil.getSkip(normalizedPage, normalizedLimit);

      // Verify employee exists and is active
      const employee = await this.prisma.employee.findFirst({
        where: {
          id: employeeId,
          status: 'ACTIVE',
        },
      });

      if (!employee) {
        throw new NotFoundException('Employee not found');
      }

      // Get employee assets with pagination and total count
      const [employeeAssets, total] = await Promise.all([
        this.prisma.employeeAsset.findMany({
          where: {
            employeeId,
          },
          include: {
            asset: {
              include: {
                categories: true,
              },
            },
          },
          orderBy: {
            assignedAt: 'desc',
          },
          skip,
          take: normalizedLimit,
        }),
        this.prisma.employeeAsset.count({
          where: {
            employeeId,
          },
        }),
      ]);

      // Map to response DTOs
      const data: EmployeeAssetResponseDto[] = employeeAssets.map((ea) => ({
        id: ea.asset.id,
        name: ea.asset.name,
        serialNumber: ea.asset.serialNumber || undefined,
        type: ea.asset.type,
        categories: ea.asset.categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
        })),
        assignedAt: ea.assignedAt,
      }));

      // Return paginated result
      return PaginationUtil.createPaginatedResult(
        data,
        normalizedPage,
        normalizedLimit,
        total,
      );
    } catch (error) {
      this.logger.error(
        `Failed to fetch assets for employeeId: ${employeeId}`,
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
   * Get team members — other active employees sharing the same branch
   */
  async getTeamMembers(
    employeeId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<TeamMemberResponseDto>> {
    const normalizedPage = PaginationUtil.normalizePage(page);
    const normalizedLimit = PaginationUtil.normalizeLimit(limit);
    const skip = PaginationUtil.getSkip(normalizedPage, normalizedLimit);

    // Resolve current employee's branch
    const current = await this.prisma.employee.findFirst({
      where: { id: employeeId, status: 'ACTIVE' },
      select: { branchId: true },
    });

    if (!current?.branchId) {
      // No branch assigned — return empty page
      return PaginationUtil.createPaginatedResult(
        [],
        normalizedPage,
        normalizedLimit,
        0,
      );
    }

    const where = {
      branchId: current.branchId,
      status: 'ACTIVE' as const,
      id: { not: employeeId },
    };

    const [members, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        select: {
          id: true,
          name: true,
          jobTitle: true,
          companyEmail: true,
        },
        orderBy: { name: 'asc' },
        skip,
        take: normalizedLimit,
      }),
      this.prisma.employee.count({ where }),
    ]);

    return PaginationUtil.createPaginatedResult(
      members,
      normalizedPage,
      normalizedLimit,
      total,
    );
  }
}

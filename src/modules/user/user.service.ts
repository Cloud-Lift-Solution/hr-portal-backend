import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { EmployeeAssetResponseDto } from './dto/employee-asset-response.dto';
import { TeamMemberResponseDto } from './dto/team-member-response.dto';
import { EmployeeOverviewResponseDto } from './dto/employee-overview-response.dto';
import { UserProfileMapper } from './mappers/get-user-profile.mapper';
import { TranslatedException } from 'src/common/exceptions/business.exception';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { I18nService } from 'nestjs-i18n';
import { hashPassword } from 'src/utils/auth/password.utility';
import {
  PaginatedResult,
  PaginationUtil,
} from '../../common/utils/pagination.util';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
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
    return this.userRepository.findEmployeeWithRelations(employeeId);
  }

  async updateProfile(
    userId: string,
    updateData: UpdateProfileDto,
    lang: string,
  ): Promise<{ message: string }> {
    try {
      // Check if user exists
      const existingUser = await this.userRepository.findUserById(userId);

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
      await this.userRepository.updateUser(userId, dataToUpdate);

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
      const employee = await this.userRepository.findEmployeeById(employeeId);

      if (!employee) {
        throw new NotFoundException('Employee not found');
      }

      // Get employee assets with pagination and total count
      const [employeeAssets, total] = await Promise.all([
        this.userRepository.findEmployeeAssets(
          employeeId,
          skip,
          normalizedLimit,
        ),
        this.userRepository.countEmployeeAssets(employeeId),
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
    const current = await this.userRepository.findEmployeeBranchId(employeeId);

    if (!current?.branchId) {
      // No branch assigned — return empty page
      return PaginationUtil.createPaginatedResult(
        [],
        normalizedPage,
        normalizedLimit,
        0,
      );
    }

    const [members, total] = await Promise.all([
      this.userRepository.findTeamMembers(
        current.branchId,
        employeeId,
        skip,
        normalizedLimit,
      ),
      this.userRepository.countTeamMembers(current.branchId, employeeId),
    ]);

    return PaginationUtil.createPaginatedResult(
      members,
      normalizedPage,
      normalizedLimit,
      total,
    );
  }

  /**
   * Get employee overview data
   */
  async getEmployeeOverview(
    employeeId: string,
  ): Promise<EmployeeOverviewResponseDto> {
    try {
      // Fetch overview data, sick leave days, and asset count in parallel
      const [overviewData, sickLeaveDays, assetCount] = await Promise.all([
        this.userRepository.findEmployeeOverviewData(employeeId),
        this.userRepository.sumSickLeaveDays(employeeId),
        this.userRepository.countEmployeeAssets(employeeId),
      ]);

      if (!overviewData) {
        throw new NotFoundException('Employee not found');
      }

      return {
        absenceDaysUsed: sickLeaveDays,
        annualVacationTotal: overviewData.totalVacationDays?.toNumber() || 0,
        annualVacationUsed: overviewData.usedVacationDays?.toNumber() || 0,
        salary: overviewData.salary?.toNumber() || null,
        totalAssignedAssets: assetCount,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch employee overview for employeeId: ${employeeId}`,
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
}

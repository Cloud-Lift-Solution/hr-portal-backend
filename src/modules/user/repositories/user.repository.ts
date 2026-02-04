import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find employee by ID with all required relations for profile
   */
  async findEmployeeWithRelations(employeeId: string) {
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

  /**
   * Find user by ID (for profile update)
   */
  async findUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, data: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  /**
   * Find employee by ID (simple check)
   */
  async findEmployeeById(employeeId: string) {
    return this.prisma.employee.findFirst({
      where: {
        id: employeeId,
        status: 'ACTIVE',
      },
    });
  }

  /**
   * Find employee assets with pagination
   */
  async findEmployeeAssets(employeeId: string, skip: number, take: number) {
    return this.prisma.employeeAsset.findMany({
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
      take,
    });
  }

  /**
   * Count employee assets
   */
  async countEmployeeAssets(employeeId: string): Promise<number> {
    return this.prisma.employeeAsset.count({
      where: {
        employeeId,
      },
    });
  }

  /**
   * Find employee's branch ID
   */
  async findEmployeeBranchId(employeeId: string) {
    return this.prisma.employee.findFirst({
      where: { id: employeeId, status: 'ACTIVE' },
      select: { branchId: true },
    });
  }

  /**
   * Find team members in the same branch
   */
  async findTeamMembers(
    branchId: string,
    excludeEmployeeId: string,
    skip: number,
    take: number,
  ) {
    return this.prisma.employee.findMany({
      where: {
        branchId,
        status: 'ACTIVE',
        id: { not: excludeEmployeeId },
      },
      select: {
        id: true,
        name: true,
        jobTitle: true,
        companyEmail: true,
      },
      orderBy: { name: 'asc' },
      skip,
      take,
    });
  }

  /**
   * Count team members in the same branch
   */
  async countTeamMembers(
    branchId: string,
    excludeEmployeeId: string,
  ): Promise<number> {
    return this.prisma.employee.count({
      where: {
        branchId,
        status: 'ACTIVE',
        id: { not: excludeEmployeeId },
      },
    });
  }
}

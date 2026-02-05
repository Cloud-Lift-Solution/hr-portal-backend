import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { EmployeeStatus } from '@prisma/client';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find active employee by company email with password and department
   * Used for authentication purposes
   */
  async findActiveByCompanyEmail(companyEmail: string) {
    return this.prisma.employee.findFirst({
      where: {
        companyEmail,
        status: EmployeeStatus.ACTIVE,
      },
      select: {
        id: true,
        name: true,
        companyEmail: true,
        jobTitle: true,
        password: true,
        faceLoginEnabled: true,
        status: true,
        branch: {
          select: {
            id: true,
            latitude: true,
            longitude: true,
            translations: {
              select: {
                name: true,
                language: {
                  select: {
                    code: true,
                  },
                },
              },
            },
            workShifts: {
              select: {
                workShift: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
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
   * Find employee by ID with minimal information
   */
  async findById(id: string) {
    return this.prisma.employee.findFirst({
      where: {
        id,
        status: EmployeeStatus.ACTIVE,
      },
      select: {
        id: true,
        name: true,
        companyEmail: true,
        jobTitle: true,
        password: true,
        faceLoginEnabled: true,
        status: true,
        branch: {
          select: {
            id: true,
            latitude: true,
            longitude: true,
            translations: {
              select: {
                name: true,
                language: {
                  select: {
                    code: true,
                  },
                },
              },
            },
            workShifts: {
              select: {
                workShift: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
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
   * Update face login enabled status
   */
  async updateFaceLoginEnabled(employeeId: string, enabled: boolean) {
    return this.prisma.employee.update({
      where: { id: employeeId },
      data: { faceLoginEnabled: enabled },
    });
  }
}

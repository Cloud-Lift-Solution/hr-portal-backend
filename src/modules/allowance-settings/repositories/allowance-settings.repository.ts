import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { EmployeeStatus } from '@prisma/client';

@Injectable()
export class AllowanceSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get the singleton settings record (first and only record)
   * Returns null if no settings exist
   */
  async getSettings() {
    const settings = await this.prisma.allowanceSettings.findFirst();

    if (!settings) return null;

    // Convert JSON fields to arrays
    return {
      ...settings,
      allowancesInVacations: Array.isArray(settings.allowancesInVacations)
        ? settings.allowancesInVacations
        : [],
      allowancesNotInVacations: Array.isArray(settings.allowancesNotInVacations)
        ? settings.allowancesNotInVacations
        : [],
      allowancesInSickLeave: Array.isArray(settings.allowancesInSickLeave)
        ? settings.allowancesInSickLeave
        : [],
      allowancesNotInSickLeave: Array.isArray(settings.allowancesNotInSickLeave)
        ? settings.allowancesNotInSickLeave
        : [],
      excludedEmployeeIds: Array.isArray(settings.excludedEmployeeIds)
        ? settings.excludedEmployeeIds
        : [],
    };
  }

  /**
   * Update settings if exists, create if not (singleton pattern)
   */
  async upsertSettings(data: {
    vacationsEnabled?: boolean;
    sickLeaveEnabled?: boolean;
    excludedEmployeesEnabled?: boolean;
    allowancesInVacations?: string[];
    allowancesNotInVacations?: string[];
    allowancesInSickLeave?: string[];
    allowancesNotInSickLeave?: string[];
    excludedEmployeeIds?: string[];
  }) {
    const existing = await this.prisma.allowanceSettings.findFirst();

    const processedData: any = { ...data };

    if (existing) {
      // Update existing record
      const updated = await this.prisma.allowanceSettings.update({
        where: { id: existing.id },
        data: processedData,
      });

      return this.normalizeSettings(updated);
    } else {
      // Create first record
      const created = await this.prisma.allowanceSettings.create({
        data: processedData,
      });

      return this.normalizeSettings(created);
    }
  }

  /**
   * Normalize settings to ensure JSON arrays are properly typed
   */
  private normalizeSettings(settings: any) {
    return {
      ...settings,
      allowancesInVacations: Array.isArray(settings.allowancesInVacations)
        ? settings.allowancesInVacations
        : [],
      allowancesNotInVacations: Array.isArray(settings.allowancesNotInVacations)
        ? settings.allowancesNotInVacations
        : [],
      allowancesInSickLeave: Array.isArray(settings.allowancesInSickLeave)
        ? settings.allowancesInSickLeave
        : [],
      allowancesNotInSickLeave: Array.isArray(settings.allowancesNotInSickLeave)
        ? settings.allowancesNotInSickLeave
        : [],
      excludedEmployeeIds: Array.isArray(settings.excludedEmployeeIds)
        ? settings.excludedEmployeeIds
        : [],
    };
  }

  /**
   * Get allowances by IDs (batch fetch)
   */
  async getAllowancesByIds(ids: string[]) {
    if (ids.length === 0) return [];

    return this.prisma.allowance.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        name: true,
        fees: true,
      },
    });
  }

  /**
   * Get active employees by IDs (batch fetch)
   */
  async getEmployeesByIds(ids: string[]) {
    if (ids.length === 0) return [];

    return this.prisma.employee.findMany({
      where: {
        id: {
          in: ids,
        },
        status: EmployeeStatus.ACTIVE,
      },
      select: {
        id: true,
        name: true,
        companyEmail: true,
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
   * Validate that all allowance IDs exist
   * Returns array of valid IDs
   */
  async validateAllowanceIds(ids: string[]): Promise<string[]> {
    if (ids.length === 0) return [];

    const allowances = await this.getAllowancesByIds(ids);
    return allowances.map((a) => a.id);
  }

  /**
   * Validate that all employee IDs exist and are ACTIVE
   * Returns array of valid IDs
   */
  async validateEmployeeIds(ids: string[]): Promise<string[]> {
    if (ids.length === 0) return [];

    const employees = await this.getEmployeesByIds(ids);
    return employees.map((e) => e.id);
  }
}

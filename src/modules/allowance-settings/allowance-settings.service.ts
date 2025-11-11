import { Injectable, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { AllowanceSettingsRepository } from './repositories/allowance-settings.repository';
import {
  UpdateAllowanceSettingsDto,
  AllowanceSettingsResponseDto,
  AllowanceInfoDto,
  EmployeeInfoDto,
  DepartmentInfoDto,
} from './dto';
import { TranslatedException } from '../../common/exceptions/business.exception';

@Injectable()
export class AllowanceSettingsService {
  private readonly logger = new Logger(AllowanceSettingsService.name);

  constructor(
    private readonly repository: AllowanceSettingsRepository,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Get allowance settings (singleton)
   * Returns default values if no settings exist
   */
  async getSettings(): Promise<AllowanceSettingsResponseDto> {
    this.logger.log('Fetching allowance settings');

    const settings = await this.repository.getSettings();

    // If no settings exist, return defaults
    if (!settings) {
      this.logger.log('No settings found, returning defaults');
      return this.getDefaultSettings();
    }

    // Fetch related data (allowances and employees)
    const [
      allowancesInVacations,
      allowancesNotInVacations,
      allowancesInSickLeave,
      allowancesNotInSickLeave,
      excludedEmployees,
    ] = await Promise.all([
      this.repository.getAllowancesByIds(settings.allowancesInVacations),
      this.repository.getAllowancesByIds(settings.allowancesNotInVacations),
      this.repository.getAllowancesByIds(settings.allowancesInSickLeave),
      this.repository.getAllowancesByIds(settings.allowancesNotInSickLeave),
      this.repository.getEmployeesByIds(settings.excludedEmployeeIds),
    ]);

    return this.mapToResponseDto(
      settings,
      allowancesInVacations,
      allowancesNotInVacations,
      allowancesInSickLeave,
      allowancesNotInSickLeave,
      excludedEmployees,
    );
  }

  /**
   * Update allowance settings
   * Creates settings if they don't exist (singleton pattern)
   */
  async updateSettings(
    updateDto: UpdateAllowanceSettingsDto,
    lang: string,
  ): Promise<AllowanceSettingsResponseDto> {
    this.logger.log('Updating allowance settings');

    // Validate the update data
    await this.validateUpdateData(updateDto, lang);

    // Remove duplicates from arrays (defensive programming)
    const cleanedData = this.removeDuplicates(updateDto);

    // Upsert settings (update if exists, create if not)
    const updated = await this.repository.upsertSettings(cleanedData);

    this.logger.log('Allowance settings updated successfully');

    // Fetch updated settings with full details
    return this.getSettings();
  }

  // ==================== VALIDATION METHODS ====================

  /**
   * Validate update data
   */
  private async validateUpdateData(
    updateDto: UpdateAllowanceSettingsDto,
    lang: string,
  ): Promise<void> {
    // Validate allowance IDs in vacation settings
    if (updateDto.allowancesInVacations) {
      await this.validateAllowanceIdsExist(
        updateDto.allowancesInVacations,
        lang,
      );
    }

    if (updateDto.allowancesNotInVacations) {
      await this.validateAllowanceIdsExist(
        updateDto.allowancesNotInVacations,
        lang,
      );
    }

    // Check for conflicts in vacation settings
    if (updateDto.allowancesInVacations && updateDto.allowancesNotInVacations) {
      this.checkForConflicts(
        updateDto.allowancesInVacations,
        updateDto.allowancesNotInVacations,
        'allowanceSettings.conflictVacations',
      );
    }

    // Validate allowance IDs in sick leave settings
    if (updateDto.allowancesInSickLeave) {
      await this.validateAllowanceIdsExist(
        updateDto.allowancesInSickLeave,
        lang,
      );
    }

    if (updateDto.allowancesNotInSickLeave) {
      await this.validateAllowanceIdsExist(
        updateDto.allowancesNotInSickLeave,
        lang,
      );
    }

    // Check for conflicts in sick leave settings
    if (updateDto.allowancesInSickLeave && updateDto.allowancesNotInSickLeave) {
      this.checkForConflicts(
        updateDto.allowancesInSickLeave,
        updateDto.allowancesNotInSickLeave,
        'allowanceSettings.conflictSickLeave',
      );
    }

    // Validate employee IDs
    if (updateDto.excludedEmployeeIds) {
      await this.validateEmployeeIdsExist(updateDto.excludedEmployeeIds, lang);
    }

    // If doing a partial update, also check conflicts with existing data
    await this.validateCrossUpdateConflicts(updateDto, lang);
  }

  /**
   * Validate that allowance IDs exist
   */
  private async validateAllowanceIdsExist(
    ids: string[],
    lang: string,
  ): Promise<void> {
    const validIds = await this.repository.validateAllowanceIds(ids);

    if (validIds.length !== ids.length) {
      throw TranslatedException.badRequest(
        'allowanceSettings.allowanceNotFound',
      );
    }
  }

  /**
   * Validate that employee IDs exist and are ACTIVE
   */
  private async validateEmployeeIdsExist(
    ids: string[],
    lang: string,
  ): Promise<void> {
    const validIds = await this.repository.validateEmployeeIds(ids);

    if (validIds.length !== ids.length) {
      throw TranslatedException.badRequest(
        'allowanceSettings.employeeNotFound',
      );
    }
  }

  /**
   * Check for conflicts between two arrays (same ID in both)
   */
  private checkForConflicts(
    array1: string[],
    array2: string[],
    errorKey: string,
  ): void {
    const set1 = new Set(array1);
    const hasConflict = array2.some((id) => set1.has(id));

    if (hasConflict) {
      throw TranslatedException.badRequest(errorKey);
    }
  }

  /**
   * Validate conflicts when doing partial update
   * Check if new data conflicts with existing data
   */
  private async validateCrossUpdateConflicts(
    updateDto: UpdateAllowanceSettingsDto,
    lang: string,
  ): Promise<void> {
    const existingSettings = await this.repository.getSettings();
    if (!existingSettings) return; // No existing settings, no conflicts possible

    // Check vacation conflicts with existing data
    if (
      updateDto.allowancesInVacations &&
      !updateDto.allowancesNotInVacations
    ) {
      this.checkForConflicts(
        updateDto.allowancesInVacations,
        existingSettings.allowancesNotInVacations,
        'allowanceSettings.conflictVacations',
      );
    }

    if (
      updateDto.allowancesNotInVacations &&
      !updateDto.allowancesInVacations
    ) {
      this.checkForConflicts(
        updateDto.allowancesNotInVacations,
        existingSettings.allowancesInVacations,
        'allowanceSettings.conflictVacations',
      );
    }

    // Check sick leave conflicts with existing data
    if (
      updateDto.allowancesInSickLeave &&
      !updateDto.allowancesNotInSickLeave
    ) {
      this.checkForConflicts(
        updateDto.allowancesInSickLeave,
        existingSettings.allowancesNotInSickLeave,
        'allowanceSettings.conflictSickLeave',
      );
    }

    if (
      updateDto.allowancesNotInSickLeave &&
      !updateDto.allowancesInSickLeave
    ) {
      this.checkForConflicts(
        updateDto.allowancesNotInSickLeave,
        existingSettings.allowancesInSickLeave,
        'allowanceSettings.conflictSickLeave',
      );
    }
  }

  /**
   * Remove duplicates from arrays
   */
  private removeDuplicates(
    updateDto: UpdateAllowanceSettingsDto,
  ): UpdateAllowanceSettingsDto {
    const cleaned: UpdateAllowanceSettingsDto = { ...updateDto };

    if (updateDto.allowancesInVacations) {
      cleaned.allowancesInVacations = [
        ...new Set(updateDto.allowancesInVacations),
      ];
    }

    if (updateDto.allowancesNotInVacations) {
      cleaned.allowancesNotInVacations = [
        ...new Set(updateDto.allowancesNotInVacations),
      ];
    }

    if (updateDto.allowancesInSickLeave) {
      cleaned.allowancesInSickLeave = [
        ...new Set(updateDto.allowancesInSickLeave),
      ];
    }

    if (updateDto.allowancesNotInSickLeave) {
      cleaned.allowancesNotInSickLeave = [
        ...new Set(updateDto.allowancesNotInSickLeave),
      ];
    }

    if (updateDto.excludedEmployeeIds) {
      cleaned.excludedEmployeeIds = [...new Set(updateDto.excludedEmployeeIds)];
    }

    return cleaned;
  }

  // ==================== HELPER METHODS ====================

  /**
   * Map database model to response DTO
   */
  private mapToResponseDto(
    settings: any,
    allowancesInVacations: any[],
    allowancesNotInVacations: any[],
    allowancesInSickLeave: any[],
    allowancesNotInSickLeave: any[],
    excludedEmployees: any[],
  ): AllowanceSettingsResponseDto {
    return {
      id: settings.id,
      vacationsEnabled: settings.vacationsEnabled,
      sickLeaveEnabled: settings.sickLeaveEnabled,
      excludedEmployeesEnabled: settings.excludedEmployeesEnabled,
      allowancesInVacations: allowancesInVacations.map((a) =>
        this.mapAllowanceToDto(a),
      ),
      allowancesNotInVacations: allowancesNotInVacations.map((a) =>
        this.mapAllowanceToDto(a),
      ),
      allowancesInSickLeave: allowancesInSickLeave.map((a) =>
        this.mapAllowanceToDto(a),
      ),
      allowancesNotInSickLeave: allowancesNotInSickLeave.map((a) =>
        this.mapAllowanceToDto(a),
      ),
      excludedEmployees: excludedEmployees.map((e) => this.mapEmployeeToDto(e)),
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };
  }

  /**
   * Get default settings when none exist
   */
  private getDefaultSettings(): AllowanceSettingsResponseDto {
    return {
      id: null,
      vacationsEnabled: true,
      sickLeaveEnabled: true,
      excludedEmployeesEnabled: true,
      allowancesInVacations: [],
      allowancesNotInVacations: [],
      allowancesInSickLeave: [],
      allowancesNotInSickLeave: [],
      excludedEmployees: [],
      createdAt: null,
      updatedAt: null,
    };
  }

  /**
   * Map allowance to DTO
   */
  private mapAllowanceToDto(allowance: any): AllowanceInfoDto {
    return {
      id: allowance.id,
      name: allowance.name,
      fees: parseFloat(allowance.fees.toString()),
    };
  }

  /**
   * Map employee to DTO
   */
  private mapEmployeeToDto(employee: any): EmployeeInfoDto {
    return {
      id: employee.id,
      name: employee.name,
      companyEmail: employee.companyEmail,
      department: employee.department
        ? this.mapDepartmentToDto(employee.department)
        : null,
    };
  }

  /**
   * Map department to DTO
   */
  private mapDepartmentToDto(department: any): DepartmentInfoDto {
    return {
      id: department.id,
      name: department.name,
    };
  }
}

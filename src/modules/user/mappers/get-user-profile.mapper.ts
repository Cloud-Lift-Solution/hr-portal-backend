import { UserProfileResponseDto } from '../dto/user-profile-response.dto';
import { Decimal } from '@prisma/client/runtime/library';

export class UserProfileMapper {
  /**
   * Map employee entity to profile DTO
   */
  static toUserProfileDto(employee: {
    id: string;
    name: string;
    civilId: string | null;
    civilIdExpiryDate: Date | null;
    passportNo: string | null;
    passportExpiryDate: Date | null;
    nationality: string | null;
    jobTitle: string | null;
    startDate: Date | null;
    type: string;
    salary: Decimal | null;
    iban: string | null;
    personalEmail: string | null;
    companyEmail: string | null;
    status: string;
    totalVacationDays: Decimal;
    usedVacationDays: Decimal;
    department: {
      id: string;
      name: string;
    } | null;
  }): UserProfileResponseDto {
    return {
      id: employee.id,
      name: employee.name,
      civilId: employee.civilId ?? undefined,
      civilIdExpiryDate: employee.civilIdExpiryDate ?? undefined,
      passportNo: employee.passportNo ?? undefined,
      passportExpiryDate: employee.passportExpiryDate ?? undefined,
      nationality: employee.nationality ?? undefined,
      jobTitle: employee.jobTitle ?? undefined,
      startDate: employee.startDate ?? undefined,
      type: employee.type,
      salary: employee.salary ? Number(employee.salary) : undefined,
      iban: employee.iban ?? undefined,
      personalEmail: employee.personalEmail ?? undefined,
      companyEmail: employee.companyEmail ?? undefined,
      status: employee.status,
      totalVacationDays: Number(employee.totalVacationDays),
      usedVacationDays: Number(employee.usedVacationDays),
      department: employee.department
        ? {
            id: employee.department.id,
            name: employee.department.name,
          }
        : undefined,
    };
  }
}

import { VacationExtensionStatus, VacationStatus, VacationReason, VacationType } from '@prisma/client';

export class VacationExtensionVacationInfoDto {
  id: string;
  departureDay: Date;
  returnDay: Date;
  reason: VacationReason;
  type: VacationType;
  numberOfDays: number;
  status: VacationStatus;
}

export class VacationExtensionEmployeeInfoDto {
  id: string;
  name: string;
  companyEmail: string | null;
  department: { id: string; name: string } | null;
  totalVacationDays: number;
  usedVacationDays: number;
  availableVacationDays: number;
}

export class VacationExtensionRequestResponseDto {
  id: string;
  vacation: VacationExtensionVacationInfoDto;
  employee: VacationExtensionEmployeeInfoDto;
  extendToDate: Date;
  additionalDays: number;
  description: string | null;
  attachmentUrls: string[];
  status: VacationExtensionStatus;
  createdAt: Date;
  updatedAt: Date;
}

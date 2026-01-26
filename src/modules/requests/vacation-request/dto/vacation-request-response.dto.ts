import {
  VacationReason,
  VacationType,
  VacationStatus,
} from '@prisma/client';

export class VacationRequestEmployeeInfoDto {
  id: string;
  name: string;
  companyEmail: string | null;
  department: { id: string; name: string } | null;
  totalVacationDays: number;
  usedVacationDays: number;
  availableVacationDays: number;
}

export class VacationRequestResponseDto {
  id: string;
  employee: VacationRequestEmployeeInfoDto;
  departureDay: Date;
  returnDay: Date;
  reason: VacationReason;
  type: VacationType;
  numberOfDays: number;
  description: string | null;
  attachmentUrls: string[];
  status: VacationStatus;
  createdAt: Date;
  updatedAt: Date;
}

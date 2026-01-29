import { VacationCancellationStatus, VacationStatus, VacationReason, VacationType } from '@prisma/client';

export class VacationCancellationVacationInfoDto {
  id: string;
  departureDay: Date;
  returnDay: Date;
  reason: VacationReason;
  type: VacationType;
  numberOfDays: number;
  status: VacationStatus;
}

export class VacationCancellationEmployeeInfoDto {
  id: string;
  name: string;
  companyEmail: string | null;
  department: { id: string; name: string } | null;
  totalVacationDays: number;
  usedVacationDays: number;
  availableVacationDays: number;
}

export class VacationCancellationRequestResponseDto {
  id: string;
  vacation: VacationCancellationVacationInfoDto;
  employee: VacationCancellationEmployeeInfoDto;
  description: string | null;
  attachmentUrls: string[];
  status: VacationCancellationStatus;
  createdAt: Date;
  updatedAt: Date;
}

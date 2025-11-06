import { VacationReason, VacationType } from '@prisma/client';

export class VacationEmployeeInfoDto {
  id: string;
  name: string;
  companyEmail: string | null;
  department: { id: string; name: string } | null;
}

export class VacationResponseDto {
  id: string;
  employee: VacationEmployeeInfoDto;
  departureDay: Date;
  returnDay: Date;
  reason: VacationReason;
  type: VacationType;
  numberOfDays: number;
  createdAt: Date;
  updatedAt: Date;
}



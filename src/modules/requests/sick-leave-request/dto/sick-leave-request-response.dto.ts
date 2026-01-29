import { SickLeaveStatus } from '@prisma/client';

export class SickLeaveRequestEmployeeInfoDto {
  id: string;
  name: string;
  companyEmail: string | null;
  department: { id: string; name: string } | null;
}

export class SickLeaveRequestResponseDto {
  id: string;
  employee: SickLeaveRequestEmployeeInfoDto;
  departureDay: Date;
  returnDay: Date;
  reason: string | null;
  numberOfDays: number;
  attachmentUrls: string[];
  status: SickLeaveStatus;
  createdAt: Date;
  updatedAt: Date;
}

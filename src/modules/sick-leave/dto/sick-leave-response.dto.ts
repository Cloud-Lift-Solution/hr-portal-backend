export class SickLeaveEmployeeInfoDto {
  id: string;
  name: string;
  companyEmail: string | null;
  department: { id: string; name: string } | null;
}

export class SickLeaveResponseDto {
  id: string;
  employee: SickLeaveEmployeeInfoDto;
  departureDay: Date;
  returnDay: Date;
  reason: string | null;
  numberOfDays: number;
  attachmentUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

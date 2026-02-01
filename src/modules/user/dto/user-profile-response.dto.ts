export class DepartmentDto {
  id: string;
  name: string;
}

export class UserProfileResponseDto {
  id: string;
  name: string;
  civilId?: string;
  civilIdExpiryDate?: Date;
  passportNo?: string;
  passportExpiryDate?: Date;
  nationality?: string;
  jobTitle?: string;
  startDate?: Date;
  type: string;
  salary?: number;
  iban?: string;
  personalEmail?: string;
  companyEmail?: string;
  status: string;
  totalVacationDays: number;
  usedVacationDays: number;
  department?: DepartmentDto;
}

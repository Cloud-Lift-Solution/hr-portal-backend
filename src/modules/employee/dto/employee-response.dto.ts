import { EmploymentType } from '@prisma/client';

export class DepartmentInfoDto {
  id: string;
  name: string;
}

export class AssetInfoDto {
  id: string;
  name: string;
  serialNumber: string | null;
  assignedAt: Date;
}

export class AttachmentInfoDto {
  id: string;
  url: string;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  uploadedAt: Date;
}

export class EmployeeResponseDto {
  id: string;
  name: string;
  civilId: string | null;
  civilIdExpiryDate: Date | null;
  passportNo: string | null;
  passportExpiryDate: Date | null;
  nationality: string | null;
  jobTitle: string | null;
  startDate: Date | null;
  type: EmploymentType;
  salary: number | null;
  iban: string | null;
  personalEmail: string | null;
  companyEmail: string | null;
  department: DepartmentInfoDto | null;
  assets: AssetInfoDto[];
  attachments: AttachmentInfoDto[];
  createdAt: Date;
  updatedAt: Date;
}


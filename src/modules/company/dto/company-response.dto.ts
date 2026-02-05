export class CompanyResponseDto {
  id: string;
  legalName: string;
  civilId: string;
  authorisedSignatory: string;
  establishmentDate: string | null;
  owner: string;
  address: string;
  description: string;
  phone: string | null;
  faxNumber: string | null;
  licenseNumber: string;
  commercialRegistration: string;
  legalOffice: string;
  createdAt: string;
  updatedAt: string;
}

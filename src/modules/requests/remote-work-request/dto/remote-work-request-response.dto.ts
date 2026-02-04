import { RemoteWorkStatus } from '@prisma/client';

export class RemoteWorkEmployeeInfoDto {
  id: string;
  name: string;
  companyEmail: string | null;
  department: { id: string; name: string } | null;
}

export class RemoteWorkRequestResponseDto {
  id: string;
  employee: RemoteWorkEmployeeInfoDto;
  requestDate: Date;
  description: string | null;
  status: RemoteWorkStatus;
  createdAt: Date;
  updatedAt: Date;
}

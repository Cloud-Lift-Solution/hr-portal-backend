export enum RequestType {
  VACATION = 'VACATION',
  SICK_LEAVE = 'SICK_LEAVE',
  VACATION_EXTENSION = 'VACATION_EXTENSION',
  VACATION_CANCELLATION = 'VACATION_CANCELLATION',
  SALARY_ADVANCE = 'SALARY_ADVANCE',
  SALARY_CERTIFICATE = 'SALARY_CERTIFICATE',
}

export interface UnifiedRequestDto {
  id: string;
  type: RequestType;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  data: any; // The actual request data (varies by type)
}

export interface PaginatedUnifiedRequestsDto {
  items: UnifiedRequestDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

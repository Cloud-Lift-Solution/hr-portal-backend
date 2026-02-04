export class WorkShiftDto {
  id: string;
  name: string;
}

export class BranchResponseDto {
  id: string;
  name: string; // Name in requested language
  openAnyTime: boolean;
  departmentId: string;
  departmentName: string;
  workShifts: WorkShiftDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class BranchDetailResponseDto {
  id: string;
  nameAr: string;
  nameEn: string;
  openAnyTime: boolean;
  departmentId: string;
  departmentName: string;
  workShifts: WorkShiftDto[];
  createdAt: Date;
  updatedAt: Date;
}

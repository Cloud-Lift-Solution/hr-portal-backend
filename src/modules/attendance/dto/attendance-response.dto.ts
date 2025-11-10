import { AttendanceStatus } from '@prisma/client';

export class BreakInfoDto {
  id: string;
  breakStart: Date;
  breakEnd: Date | null;
  duration: number | null; // in minutes
}

export class EmployeeInfoDto {
  id: string;
  name: string;
  companyEmail: string | null;
  department: {
    id: string;
    name: string;
  } | null;
}

export class AttendanceResponseDto {
  id: string;
  date: Date;
  clockInTime: Date;
  clockOutTime: Date | null;
  totalHours: number | null;
  currentWorkingHours?: number | null; // For non-completed days
  totalBreakMinutes: number;
  status: AttendanceStatus;
  breaks: BreakInfoDto[];
  isToday?: boolean;
  employee?: EmployeeInfoDto;
  createdAt: Date;
  updatedAt: Date;
}

export class TodayStatusResponseDto {
  hasRecord: boolean;
  date: string | null;
  status: AttendanceStatus | null;
  clockInTime: Date | null;
  clockOutTime: Date | null;
  currentWorkingHours: number | null;
  totalBreakMinutes: number;
  breaks: BreakInfoDto[];
  canClockIn: boolean;
  canTakeBreak: boolean;
  canBackToWork: boolean;
  canClockOut: boolean;
}

export class ClockInResponseDto {
  id: string;
  date: Date;
  clockInTime: Date;
  status: AttendanceStatus;
  message: string;
}

export class BreakResponseDto {
  id: string;
  date: Date;
  status: AttendanceStatus;
  breakStart?: Date;
  breakEnd?: Date;
  breakDuration?: number;
  totalBreakMinutes: number;
  message: string;
}

export class ClockOutResponseDto {
  id: string;
  date: Date;
  clockInTime: Date;
  clockOutTime: Date;
  totalHours: number;
  totalBreakMinutes: number;
  breaks: BreakInfoDto[];
  status: AttendanceStatus;
  message: string;
}

export class PeriodHoursResponseDto {
  period: {
    startDate: string;
    endDate: string;
  };
  totalHours: number;
  daysWorked: number;
  averageHoursPerDay: number;
}

export class AttendanceListResponseDto {
  data: AttendanceResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class MyHistoryResponseDto {
  data: AttendanceResponseDto[];
  summary: {
    totalHours: number;
    totalDays: number;
    todayWorkingHours: number | null;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

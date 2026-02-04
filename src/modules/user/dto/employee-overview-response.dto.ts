export class EmployeeOverviewResponseDto {
  absenceDaysUsed: number; // Sick leave days taken
  annualVacationTotal: number; // Total vacation days allowance
  annualVacationUsed: number; // Vacation days consumed
  salary: number | null;
  totalAssignedAssets: number;
}

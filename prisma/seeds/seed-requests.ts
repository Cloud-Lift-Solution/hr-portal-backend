import {
  PrismaClient,
  VacationStatus,
  VacationReason,
  VacationType,
  SickLeaveStatus,
  VacationExtensionStatus,
  VacationCancellationStatus,
  SalaryAdvanceStatus,
  SalaryCertificateStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting requests seed...');

  // Get or create an employee
  let employee = await prisma.employee.findFirst({
    where: {
      status: 'ACTIVE',
    },
  });

  if (!employee) {
    console.log('⚠️  No active employee found. Please run seed-employee first.');
    return;
  }

  console.log(`✅ Using employee: ${employee.name} (${employee.companyEmail})`);

  // Update employee vacation days
  await prisma.employee.update({
    where: { id: employee.id },
    data: {
      totalVacationDays: 30,
      usedVacationDays: 8, // Will be used by approved vacations
    },
  });
  console.log('✅ Updated employee vacation balance');

  // Clear existing requests for this employee (optional - for clean seed)
  await prisma.vacation.deleteMany({ where: { employeeId: employee.id } });
  await prisma.sickLeave.deleteMany({ where: { employeeId: employee.id } });
  await prisma.salaryAdvanceRequest.deleteMany({
    where: { employeeId: employee.id },
  });
  await prisma.salaryCertificateRequest.deleteMany({
    where: { employeeId: employee.id },
  });
  console.log('✅ Cleared existing requests');

  // ============ VACATION REQUESTS ============
  console.log('\n📅 Creating vacation requests...');

  // 1. Approved vacation (past)
  const approvedVacation = await prisma.vacation.create({
    data: {
      employeeId: employee.id,
      departureDay: new Date('2026-01-10'),
      returnDay: new Date('2026-01-14'),
      numberOfDays: 5,
      reason: VacationReason.ANNUAL_LEAVE,
      type: VacationType.PAID,
      description: 'Winter vacation trip',
      attachmentUrls: ['https://example.com/vacation-plan.pdf'],
      status: VacationStatus.APPROVED,
      createdAt: new Date('2025-12-20'),
    },
  });
  console.log('  ✅ Created APPROVED vacation (Jan 10-14)');

  // 2. Pending vacation (future)
  await prisma.vacation.create({
    data: {
      employeeId: employee.id,
      departureDay: new Date('2026-03-15'),
      returnDay: new Date('2026-03-20'),
      numberOfDays: 6,
      reason: VacationReason.ANNUAL_LEAVE,
      type: VacationType.PAID,
      description: 'Spring break with family',
      attachmentUrls: ['https://example.com/travel-booking.pdf'],
      status: VacationStatus.PENDING,
    },
  });
  console.log('  ✅ Created PENDING vacation (Mar 15-20)');

  // 3. Another pending vacation
  await prisma.vacation.create({
    data: {
      employeeId: employee.id,
      departureDay: new Date('2026-07-01'),
      returnDay: new Date('2026-07-10'),
      numberOfDays: 10,
      reason: VacationReason.ANNUAL_LEAVE,
      type: VacationType.PAID,
      description: 'Summer vacation',
      status: VacationStatus.PENDING,
    },
  });
  console.log('  ✅ Created PENDING vacation (Jul 1-10)');

  // 4. Rejected vacation
  await prisma.vacation.create({
    data: {
      employeeId: employee.id,
      departureDay: new Date('2026-02-20'),
      returnDay: new Date('2026-02-25'),
      numberOfDays: 6,
      reason: VacationReason.EMERGENCY_LEAVE,
      type: VacationType.PAID,
      description: 'Emergency leave - family matter',
      status: VacationStatus.REJECTED,
      createdAt: new Date('2026-01-15'),
      updatedAt: new Date('2026-01-16'),
    },
  });
  console.log('  ✅ Created REJECTED vacation (Feb 20-25)');

  // 5. Another approved vacation for extension/cancellation
  const approvedVacation2 = await prisma.vacation.create({
    data: {
      employeeId: employee.id,
      departureDay: new Date('2026-04-10'),
      returnDay: new Date('2026-04-13'),
      numberOfDays: 4,
      reason: VacationReason.ANNUAL_LEAVE,
      type: VacationType.PAID,
      description: 'Short break',
      status: VacationStatus.APPROVED,
    },
  });
  console.log('  ✅ Created APPROVED vacation for extensions (Apr 10-13)');

  // ============ SICK LEAVE REQUESTS ============
  console.log('\n🏥 Creating sick leave requests...');

  // 1. Approved sick leave
  await prisma.sickLeave.create({
    data: {
      employeeId: employee.id,
      departureDay: new Date('2026-01-20'),
      returnDay: new Date('2026-01-22'),
      numberOfDays: 3,
      reason: 'Flu symptoms',
      attachmentUrls: ['https://example.com/medical-certificate.pdf'],
      status: SickLeaveStatus.APPROVED,
      createdAt: new Date('2026-01-19'),
    },
  });
  console.log('  ✅ Created APPROVED sick leave (Jan 20-22)');

  // 2. Pending sick leave
  await prisma.sickLeave.create({
    data: {
      employeeId: employee.id,
      departureDay: new Date('2026-02-05'),
      returnDay: new Date('2026-02-07'),
      numberOfDays: 3,
      reason: 'Doctor appointment and recovery',
      attachmentUrls: ['https://example.com/doctors-note.pdf'],
      status: SickLeaveStatus.PENDING,
    },
  });
  console.log('  ✅ Created PENDING sick leave (Feb 5-7)');

  // 3. Rejected sick leave
  await prisma.sickLeave.create({
    data: {
      employeeId: employee.id,
      departureDay: new Date('2026-01-25'),
      returnDay: new Date('2026-01-26'),
      numberOfDays: 2,
      reason: 'Minor illness',
      status: SickLeaveStatus.REJECTED,
      createdAt: new Date('2026-01-24'),
      updatedAt: new Date('2026-01-24'),
    },
  });
  console.log('  ✅ Created REJECTED sick leave (Jan 25-26)');

  // ============ VACATION EXTENSION REQUESTS ============
  console.log('\n⏰ Creating vacation extension requests...');

  // 1. Pending extension
  await prisma.vacationExtensionRequest.create({
    data: {
      vacationId: approvedVacation2.id,
      extendToDate: new Date('2026-04-17'),
      additionalDays: 4,
      description: 'Need more time with family',
      attachmentUrls: ['https://example.com/extension-reason.pdf'],
      status: VacationExtensionStatus.PENDING,
    },
  });
  console.log('  ✅ Created PENDING vacation extension');

  // 2. Rejected extension
  await prisma.vacationExtensionRequest.create({
    data: {
      vacationId: approvedVacation.id,
      extendToDate: new Date('2026-01-18'),
      additionalDays: 4,
      description: 'Flight delayed',
      status: VacationExtensionStatus.REJECTED,
      createdAt: new Date('2026-01-12'),
      updatedAt: new Date('2026-01-13'),
    },
  });
  console.log('  ✅ Created REJECTED vacation extension');

  // ============ VACATION CANCELLATION REQUESTS ============
  console.log('\n❌ Creating vacation cancellation requests...');

  // 1. Pending cancellation
  await prisma.vacationCancellationRequest.create({
    data: {
      vacationId: approvedVacation2.id,
      description: 'Work emergency - project deadline',
      attachmentUrls: ['https://example.com/work-emergency.pdf'],
      status: VacationCancellationStatus.PENDING,
    },
  });
  console.log('  ✅ Created PENDING vacation cancellation');

  // ============ SALARY ADVANCE REQUESTS ============
  console.log('\n💰 Creating salary advance requests...');

  // 1. Approved salary advance
  await prisma.salaryAdvanceRequest.create({
    data: {
      employeeId: employee.id,
      month: 2,
      year: 2026,
      description: 'Emergency medical expenses',
      status: SalaryAdvanceStatus.APPROVED,
      createdAt: new Date('2026-01-15'),
      updatedAt: new Date('2026-01-16'),
    },
  });
  console.log('  ✅ Created APPROVED salary advance (Feb 2026)');

  // 2. Pending salary advance
  await prisma.salaryAdvanceRequest.create({
    data: {
      employeeId: employee.id,
      month: 3,
      year: 2026,
      description: 'Home renovation',
      status: SalaryAdvanceStatus.PENDING,
    },
  });
  console.log('  ✅ Created PENDING salary advance (Mar 2026)');

  // 3. Rejected salary advance
  await prisma.salaryAdvanceRequest.create({
    data: {
      employeeId: employee.id,
      month: 1,
      year: 2026,
      description: 'Personal expenses',
      status: SalaryAdvanceStatus.REJECTED,
      createdAt: new Date('2026-01-05'),
      updatedAt: new Date('2026-01-06'),
    },
  });
  console.log('  ✅ Created REJECTED salary advance (Jan 2026)');

  // ============ SALARY CERTIFICATE REQUESTS ============
  console.log('\n📄 Creating salary certificate requests...');

  // 1. Approved certificate
  await prisma.salaryCertificateRequest.create({
    data: {
      employeeId: employee.id,
      reason: 'Bank loan application',
      description: 'Need certificate for housing loan at National Bank',
      status: SalaryCertificateStatus.APPROVED,
      createdAt: new Date('2026-01-10'),
      updatedAt: new Date('2026-01-11'),
    },
  });
  console.log('  ✅ Created APPROVED salary certificate');

  // 2. Pending certificate
  await prisma.salaryCertificateRequest.create({
    data: {
      employeeId: employee.id,
      reason: 'Visa application',
      description: 'Certificate required for travel visa to Europe',
      status: SalaryCertificateStatus.PENDING,
    },
  });
  console.log('  ✅ Created PENDING salary certificate');

  // 3. Another pending certificate
  await prisma.salaryCertificateRequest.create({
    data: {
      employeeId: employee.id,
      reason: 'Credit card application',
      description: 'Applying for platinum credit card',
      status: SalaryCertificateStatus.PENDING,
    },
  });
  console.log('  ✅ Created PENDING salary certificate');

  console.log('\n✨ Requests seed completed successfully!');
  console.log('\nSummary:');
  console.log('  📅 Vacations: 2 APPROVED, 2 PENDING, 1 REJECTED');
  console.log('  🏥 Sick Leaves: 1 APPROVED, 1 PENDING, 1 REJECTED');
  console.log('  ⏰ Extensions: 1 PENDING, 1 REJECTED');
  console.log('  ❌ Cancellations: 1 PENDING');
  console.log('  💰 Salary Advances: 1 APPROVED, 1 PENDING, 1 REJECTED');
  console.log('  📄 Salary Certificates: 1 APPROVED, 2 PENDING');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding requests:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

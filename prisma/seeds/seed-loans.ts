import {
  PrismaClient,
  LoanStatus,
  LoanType,
  InstallmentStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const employeeId = '12d6adb1-9786-4bf7-a609-a4a3036d6d56';

  // Verify employee exists
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });

  if (!employee) {
    console.error(`Employee with ID ${employeeId} not found!`);
    process.exit(1);
  }

  console.log(`Creating loans for employee: ${employee.name}`);

  // Define 10 loans - 5 ACTIVE and 5 COMPLETED
  const loans = [
    // ACTIVE loans
    {
      loanAmount: 300,
      purpose: 'Personal Loan',
      numberOfInstallments: 6,
      numberOfPaymentsMade: 2,
      status: LoanStatus.ACTIVE,
      startDate: new Date('2025-01-03'),
    },
    {
      loanAmount: 500,
      purpose: 'Emergency Medical',
      numberOfInstallments: 10,
      numberOfPaymentsMade: 3,
      status: LoanStatus.ACTIVE,
      startDate: new Date('2025-02-01'),
    },
    {
      loanAmount: 1000,
      purpose: 'Education Loan',
      numberOfInstallments: 12,
      numberOfPaymentsMade: 5,
      status: LoanStatus.ACTIVE,
      startDate: new Date('2024-10-01'),
    },
    {
      loanAmount: 200,
      purpose: 'Travel Advance',
      numberOfInstallments: 4,
      numberOfPaymentsMade: 1,
      status: LoanStatus.ACTIVE,
      startDate: new Date('2025-12-01'),
    },
    {
      loanAmount: 750,
      purpose: 'Home Repair',
      numberOfInstallments: 8,
      numberOfPaymentsMade: 4,
      status: LoanStatus.ACTIVE,
      startDate: new Date('2024-08-01'),
    },
    // COMPLETED loans
    {
      loanAmount: 400,
      purpose: 'Car Repair',
      numberOfInstallments: 4,
      numberOfPaymentsMade: 4,
      status: LoanStatus.COMPLETED,
      startDate: new Date('2024-01-01'),
    },
    {
      loanAmount: 600,
      purpose: 'Wedding Expense',
      numberOfInstallments: 6,
      numberOfPaymentsMade: 6,
      status: LoanStatus.COMPLETED,
      startDate: new Date('2024-03-01'),
    },
    {
      loanAmount: 250,
      purpose: 'Furniture Purchase',
      numberOfInstallments: 5,
      numberOfPaymentsMade: 5,
      status: LoanStatus.COMPLETED,
      startDate: new Date('2024-05-01'),
    },
    {
      loanAmount: 150,
      purpose: 'Phone Advance',
      numberOfInstallments: 3,
      numberOfPaymentsMade: 3,
      status: LoanStatus.COMPLETED,
      startDate: new Date('2024-06-01'),
    },
    {
      loanAmount: 800,
      purpose: 'Relocation Expense',
      numberOfInstallments: 8,
      numberOfPaymentsMade: 8,
      status: LoanStatus.COMPLETED,
      startDate: new Date('2023-09-01'),
    },
  ];

  console.log('Creating 10 loans with installments...\n');

  for (let i = 0; i < loans.length; i++) {
    const loanData = loans[i];
    const installmentAmount =
      loanData.loanAmount / loanData.numberOfInstallments;

    // Create the loan
    const loan = await prisma.loan.create({
      data: {
        employeeId,
        loanAmount: loanData.loanAmount,
        purpose: loanData.purpose,
        type: LoanType.ADD_TO_PAYROLL,
        numberOfInstallments: loanData.numberOfInstallments,
        numberOfPaymentsMade: loanData.numberOfPaymentsMade,
        month: loanData.startDate.getMonth() + 1,
        year: loanData.startDate.getFullYear(),
        paymentStartDate: loanData.startDate,
        status: loanData.status,
      },
    });

    // Create installments
    const installments = [];
    for (let j = 0; j < loanData.numberOfInstallments; j++) {
      const dueDate = new Date(loanData.startDate);
      dueDate.setMonth(dueDate.getMonth() + j);

      const isPaid = j < loanData.numberOfPaymentsMade;

      installments.push({
        loanId: loan.id,
        installmentNumber: j + 1,
        amount: installmentAmount,
        dueMonth: dueDate.getMonth() + 1,
        dueYear: dueDate.getFullYear(),
        status: isPaid ? InstallmentStatus.PAID : InstallmentStatus.PENDING,
        paidAt: isPaid ? new Date() : null,
      });
    }

    await prisma.loanInstallment.createMany({
      data: installments,
    });

    const paidInstallments = loanData.numberOfPaymentsMade;
    const pendingInstallments =
      loanData.numberOfInstallments - paidInstallments;

    console.log(
      `Created loan ${i + 1}: ${loanData.purpose} (${loanData.status}) - ${loanData.loanAmount} KD`,
    );
    console.log(
      `  - ${loanData.numberOfInstallments} installments: ${paidInstallments} PAID, ${pendingInstallments} PENDING`,
    );
  }

  console.log('\nDone! Created 10 loans with installments.');
  console.log('- 5 ACTIVE loans');
  console.log('- 5 COMPLETED loans');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

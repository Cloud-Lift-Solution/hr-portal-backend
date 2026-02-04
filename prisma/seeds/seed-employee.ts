import { PrismaClient, EmploymentType, EmployeeStatus } from '@prisma/client';
import { hashPassword } from '../../src/utils/auth/password.utility';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting employee seed...');

  // Hash the password
  const hashedPassword = await hashPassword('Ibrahim@123');
  console.log('✅ Password hashed successfully');

  // 1. Ensure languages exist (required for branch translations)
  let enLanguage = await prisma.language.findUnique({
    where: { code: 'en' },
  });

  if (!enLanguage) {
    console.log('🌐 Creating English language...');
    enLanguage = await prisma.language.create({
      data: {
        code: 'en',
        name: 'English',
      },
    });
    console.log('✅ English language created');
  }

  let arLanguage = await prisma.language.findUnique({
    where: { code: 'ar' },
  });

  if (!arLanguage) {
    console.log('🌐 Creating Arabic language...');
    arLanguage = await prisma.language.create({
      data: {
        code: 'ar',
        name: 'العربية',
      },
    });
    console.log('✅ Arabic language created');
  }

  // 2. Check if department exists, if not create one
  let department = await prisma.department.findFirst();

  if (!department) {
    console.log('📦 No department found, creating default department...');
    department = await prisma.department.create({
      data: {
        name: 'Administration',
      },
    });
    console.log(`✅ Created department: ${department.name}`);
  } else {
    console.log(`✅ Using existing department: ${department.name}`);
  }

  // 3. Check if default work shift exists, if not create one
  let workShift = await prisma.workShift.findFirst();

  if (!workShift) {
    console.log('⏰ No work shift found, creating default work shift...');
    workShift = await prisma.workShift.create({
      data: {
        name: 'Standard Shift',
        clockIn: new Date('1970-01-01T09:00:00.000Z'),
        clockOut: new Date('1970-01-01T17:00:00.000Z'),
      },
    });
    console.log(`✅ Created work shift: ${workShift.name} (09:00 - 17:00)`);
  } else {
    console.log(`✅ Using existing work shift: ${workShift.name}`);
  }

  // 4. Check if default branch exists, if not create one
  let branch = await prisma.branch.findFirst({
    where: {
      departmentId: department.id,
    },
    include: {
      translations: true,
    },
  });

  if (!branch) {
    console.log('🏢 No branch found, creating default branch...');
    branch = await prisma.branch.create({
      data: {
        departmentId: department.id,
        openAnyTime: true,
        translations: {
          create: [
            {
              languageId: enLanguage.id,
              name: 'Main Office',
            },
            {
              languageId: arLanguage.id,
              name: 'المكتب الرئيسي',
            },
          ],
        },
        workShifts: {
          create: [{ workShiftId: workShift.id }],
        },
      },
      include: {
        translations: true,
      },
    });
    console.log(`✅ Created branch: Main Office / المكتب الرئيسي`);
  } else {
    console.log(`✅ Using existing branch (ID: ${branch.id})`);
  }

  // Check if employee with this email already exists
  const existingEmployee = await prisma.employee.findUnique({
    where: {
      companyEmail: 'ibrahim@syntax.com',
    },
  });

  if (existingEmployee) {
    console.log('⚠️  Employee with email ibrahim@syntax.com already exists');
    console.log(`   Employee ID: ${existingEmployee.id}`);
    console.log(`   Employee Name: ${existingEmployee.name}`);

    // Update the password and branch
    const updatedEmployee = await prisma.employee.update({
      where: {
        companyEmail: 'ibrahim@syntax.com',
      },
      data: {
        password: hashedPassword,
        branchId: branch.id,
      },
    });
    console.log('✅ Updated employee password and branch assignment');
    return;
  }

  // Create the employee
  const employee = await prisma.employee.create({
    data: {
      name: 'Ibrahim Ahmed',
      companyEmail: 'ibrahim@syntax.com',
      password: hashedPassword,
      type: EmploymentType.FULL_TIME,
      status: EmployeeStatus.ACTIVE,
      branchId: branch.id,
      jobTitle: 'Software Engineer',
      startDate: new Date(),
      nationality: 'Kuwait',
      personalEmail: 'ibrahim.personal@example.com',
    },
  });

  console.log('✅ Employee created successfully:');
  console.log(`   ID: ${employee.id}`);
  console.log(`   Name: ${employee.name}`);
  console.log(`   Email: ${employee.companyEmail}`);
  console.log(`   Branch: Main Office (${branch.id})`);
  console.log(`   Department: ${department.name}`);
  console.log(`   Job Title: ${employee.jobTitle}`);
  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding employee:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

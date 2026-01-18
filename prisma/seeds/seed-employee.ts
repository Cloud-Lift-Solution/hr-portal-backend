import { PrismaClient, EmploymentType, EmployeeStatus } from '@prisma/client';
import { hashPassword } from '../../src/utils/auth/password.utility';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting employee seed...');

  // Hash the password
  const hashedPassword = await hashPassword('Ibrahim@123');
  console.log('✅ Password hashed successfully');

  // Check if department exists, if not create one
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

    // Update the password
    const updatedEmployee = await prisma.employee.update({
      where: {
        companyEmail: 'ibrahim@syntax.com',
      },
      data: {
        password: hashedPassword,
      },
    });
    console.log('✅ Updated employee password');
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
      departmentId: department.id,
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

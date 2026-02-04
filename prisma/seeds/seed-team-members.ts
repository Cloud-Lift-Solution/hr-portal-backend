import { PrismaClient, EmploymentType, EmployeeStatus } from '@prisma/client';
import { hashPassword } from '../../src/utils/auth/password.utility';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting team members seed...');

  // Accept email via CLI arg or use default
  const targetEmail = process.argv[2] || 'ibrahim@syntax.com';
  console.log(`🔍 Looking for employee: ${targetEmail}`);

  // Find the target employee
  const targetEmployee = await prisma.employee.findUnique({
    where: { companyEmail: targetEmail },
    include: {
      branch: {
        include: {
          department: true,
        },
      },
    },
  });

  if (!targetEmployee) {
    console.error(`❌ Employee with email ${targetEmail} not found`);
    process.exit(1);
  }

  if (!targetEmployee.branchId) {
    console.error(`❌ Employee ${targetEmail} has no branch assigned`);
    process.exit(1);
  }

  console.log(`✅ Found employee: ${targetEmployee.name}`);
  console.log(`   Branch ID: ${targetEmployee.branchId}`);
  console.log(`   Department: ${targetEmployee.branch?.department?.name || 'N/A'}`);

  // Hash password for team members
  const hashedPassword = await hashPassword('TeamMember@123');
  console.log('✅ Password hashed successfully');

  // Define team members
  const teamMembers = [
    {
      name: 'Sara Al-Mansouri',
      companyEmail: 'sara@syntax.com',
      jobTitle: 'UI/UX Designer',
      nationality: 'Kuwait',
      personalEmail: 'sara.personal@example.com',
    },
    {
      name: 'Yousuf Al-Rashid',
      companyEmail: 'yousuf@syntax.com',
      jobTitle: 'Senior Developer',
      nationality: 'Kuwait',
      personalEmail: 'yousuf.personal@example.com',
    },
    {
      name: 'Fatima Hassan',
      companyEmail: 'fatima@syntax.com',
      jobTitle: 'Product Manager',
      nationality: 'Kuwait',
      personalEmail: 'fatima.personal@example.com',
    },
  ];

  let createdCount = 0;
  let skippedCount = 0;

  for (const memberData of teamMembers) {
    // Check if employee already exists
    const existing = await prisma.employee.findUnique({
      where: { companyEmail: memberData.companyEmail },
    });

    if (existing) {
      console.log(`⚠️  ${memberData.name} (${memberData.companyEmail}) already exists - updating branch`);
      await prisma.employee.update({
        where: { companyEmail: memberData.companyEmail },
        data: {
          branchId: targetEmployee.branchId,
          password: hashedPassword,
        },
      });
      skippedCount++;
      continue;
    }

    // Create new employee
    const newEmployee = await prisma.employee.create({
      data: {
        name: memberData.name,
        companyEmail: memberData.companyEmail,
        password: hashedPassword,
        type: EmploymentType.FULL_TIME,
        status: EmployeeStatus.ACTIVE,
        branchId: targetEmployee.branchId,
        jobTitle: memberData.jobTitle,
        startDate: new Date(),
        nationality: memberData.nationality,
        personalEmail: memberData.personalEmail,
      },
    });

    console.log(`✅ Created: ${newEmployee.name} (${newEmployee.companyEmail})`);
    console.log(`   Job Title: ${newEmployee.jobTitle}`);
    console.log(`   Branch: ${targetEmployee.branchId}`);
    createdCount++;
  }

  console.log('\n🎉 Seed completed!');
  console.log(`   Created: ${createdCount} new team members`);
  console.log(`   Updated: ${skippedCount} existing team members`);
  console.log(`   Total team size (including ${targetEmployee.name}): ${createdCount + skippedCount + 1}`);
  console.log('\n📝 Test credentials:');
  console.log('   Email: sara@syntax.com | yousuf@syntax.com | fatima@syntax.com');
  console.log('   Password: TeamMember@123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding team members:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

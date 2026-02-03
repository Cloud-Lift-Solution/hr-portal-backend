import { PrismaClient, AssetType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting employee assets seed...');

  // Get employee from command line argument or use default email
  const employeeEmail =
    process.argv[2] || 'ibrahim@syntax.com';

  // Find employee by email
  const employee = await prisma.employee.findUnique({
    where: {
      companyEmail: employeeEmail,
    },
  });

  if (!employee) {
    console.error(`❌ Employee with email ${employeeEmail} not found`);
    console.log('💡 Usage: npx ts-node prisma/seeds/seed-employee-assets.ts [employee@email.com]');
    process.exit(1);
  }

  console.log(`✅ Found employee: ${employee.name} (${employee.companyEmail})`);

  // Define assets to create
  const assetsData = [
    {
      name: 'MacBook Pro 16"',
      serialNumber: 'MBP-2024-001',
      type: AssetType.WITH_SERIAL_NUMBER,
      categories: [],
    },
    {
      name: 'iPhone 15 Pro',
      serialNumber: 'IP15-2024-042',
      type: AssetType.WITH_SERIAL_NUMBER,
      categories: [],
    },
    {
      name: 'Office Desk',
      serialNumber: null,
      type: AssetType.WITH_CATEGORIES,
      categories: ['Furniture', 'Office Equipment'],
    },
    {
      name: 'Dell Monitor 27"',
      serialNumber: 'DELL-MON-2024-123',
      type: AssetType.WITH_SERIAL_NUMBER_AND_CATEGORIES,
      categories: ['Electronics', 'Display'],
    },
    {
      name: 'Wireless Mouse',
      serialNumber: 'WM-2024-567',
      type: AssetType.WITH_SERIAL_NUMBER_AND_CATEGORIES,
      categories: ['Electronics', 'Peripherals'],
    },
    {
      name: 'Office Chair',
      serialNumber: null,
      type: AssetType.WITH_CATEGORIES,
      categories: ['Furniture', 'Ergonomic'],
    },
  ];

  console.log('📦 Creating assets...');

  for (const assetData of assetsData) {
    // Check if asset already exists by name
    let asset = await prisma.asset.findFirst({
      where: {
        name: assetData.name,
      },
    });

    if (asset) {
      console.log(`   ⚠️  Asset "${assetData.name}" already exists, skipping creation`);
    } else {
      // Create asset
      asset = await prisma.asset.create({
        data: {
          name: assetData.name,
          serialNumber: assetData.serialNumber,
          type: assetData.type,
        },
      });
      console.log(`   ✅ Created asset: ${asset.name} (${asset.type})`);

      // Create categories if any
      if (assetData.categories.length > 0) {
        for (const categoryName of assetData.categories) {
          await prisma.assetCategory.create({
            data: {
              name: categoryName,
              assetId: asset.id,
            },
          });
          console.log(`      - Added category: ${categoryName}`);
        }
      }
    }

    // Check if asset is already assigned to employee
    const existingAssignment = await prisma.employeeAsset.findUnique({
      where: {
        employeeId_assetId: {
          employeeId: employee.id,
          assetId: asset.id,
        },
      },
    });

    if (existingAssignment) {
      console.log(`   ⚠️  Asset "${asset.name}" already assigned to employee`);
    } else {
      // Assign asset to employee
      await prisma.employeeAsset.create({
        data: {
          employeeId: employee.id,
          assetId: asset.id,
        },
      });
      console.log(`   ✅ Assigned "${asset.name}" to ${employee.name}`);
    }
  }

  console.log('\n🎉 Seed completed!');
  console.log(`📊 Total assets assigned to ${employee.name}: ${assetsData.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding employee assets:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

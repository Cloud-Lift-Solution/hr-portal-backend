import { PrismaClient, TicketStatus, TicketPriority } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const employeeId = '12d6adb1-9786-4bf7-a609-a4a3036d6d56';

  // First, create ticket categories if they don't exist
  const existingCategories = await prisma.ticketCategory.findMany();

  let categories = existingCategories;

  if (existingCategories.length === 0) {
    console.log('Creating ticket categories...');

    const category1 = await prisma.ticketCategory.create({
      data: {
        translations: {
          create: [
            { language: 'en', name: 'Leave Request' },
            { language: 'ar', name: 'طلب إجازة' },
          ],
        },
      },
    });

    const category2 = await prisma.ticketCategory.create({
      data: {
        translations: {
          create: [
            { language: 'en', name: 'IT Support' },
            { language: 'ar', name: 'الدعم الفني' },
          ],
        },
      },
    });

    const category3 = await prisma.ticketCategory.create({
      data: {
        translations: {
          create: [
            { language: 'en', name: 'HR Inquiry' },
            { language: 'ar', name: 'استفسار الموارد البشرية' },
          ],
        },
      },
    });

    const category4 = await prisma.ticketCategory.create({
      data: {
        translations: {
          create: [
            { language: 'en', name: 'Payroll Issue' },
            { language: 'ar', name: 'مشكلة الراتب' },
          ],
        },
      },
    });

    categories = [category1, category2, category3, category4];
    console.log('Created 4 ticket categories');
  }

  // Create 10 support tickets with different statuses and priorities
  const tickets = [
    {
      title: 'Leave request not showing',
      description: 'Need to update my phone number and address.',
      priority: TicketPriority.HIGH,
      status: TicketStatus.OPEN,
    },
    {
      title: 'Cannot access email',
      description: 'My company email is not working since yesterday.',
      priority: TicketPriority.HIGH,
      status: TicketStatus.OPEN,
    },
    {
      title: 'Salary discrepancy',
      description: 'My last month salary was incorrect. Please check.',
      priority: TicketPriority.HIGH,
      status: TicketStatus.CLOSED,
    },
    {
      title: 'Request for equipment',
      description: 'I need a new keyboard and mouse for my workstation.',
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.OPEN,
    },
    {
      title: 'VPN connection issue',
      description: 'Unable to connect to VPN when working from home.',
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.CLOSED,
    },
    {
      title: 'Annual leave balance inquiry',
      description: 'Please clarify my remaining annual leave days.',
      priority: TicketPriority.LOW,
      status: TicketStatus.CLOSED,
    },
    {
      title: 'Overtime calculation',
      description: 'My overtime hours were not calculated correctly.',
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.OPEN,
    },
    {
      title: 'ID card replacement',
      description: 'I lost my employee ID card and need a replacement.',
      priority: TicketPriority.LOW,
      status: TicketStatus.CLOSED,
    },
    {
      title: 'Parking access',
      description: 'Need parking access card for the new building.',
      priority: TicketPriority.LOW,
      status: TicketStatus.OPEN,
    },
    {
      title: 'Medical insurance query',
      description: 'Need information about dental coverage in my insurance.',
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.CLOSED,
    },
  ];

  console.log('Creating 10 support tickets...');

  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i];
    const categoryIndex = i % categories.length;

    await prisma.supportTicket.create({
      data: {
        employeeId,
        title: ticket.title,
        description: ticket.description,
        categoryId: categories[categoryIndex].id,
        priority: ticket.priority,
        status: ticket.status,
      },
    });

    console.log(`Created ticket ${i + 1}: ${ticket.title} (${ticket.status})`);
  }

  console.log('\nDone! Created 10 support tickets.');
  console.log('- 5 OPEN tickets');
  console.log('- 5 CLOSED tickets');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

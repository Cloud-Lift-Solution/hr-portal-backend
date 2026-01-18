import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { TicketPriority, TicketStatus } from '@prisma/client';

@Injectable()
export class SupportTicketRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new support ticket
   */
  async create(
    employeeId: string,
    title: string,
    description: string,
    categoryId: string,
    priority: TicketPriority,
  ) {
    return this.prisma.supportTicket.create({
      data: {
        employeeId,
        title,
        description,
        categoryId,
        priority,
      },
      include: {
        category: {
          include: {
            translations: true,
          },
        },
      },
    });
  }

  /**
   * Find all tickets for an employee
   */
  async findByEmployee(employeeId: string) {
    return this.prisma.supportTicket.findMany({
      where: {
        employeeId,
      },
      include: {
        category: {
          include: {
            translations: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Find ticket by ID
   */
  async findById(id: string) {
    return this.prisma.supportTicket.findUnique({
      where: { id },
      include: {
        category: {
          include: {
            translations: true,
          },
        },
      },
    });
  }

  /**
   * Update ticket status
   */
  async updateStatus(id: string, status: TicketStatus) {
    return this.prisma.supportTicket.update({
      where: { id },
      data: { status },
      include: {
        category: {
          include: {
            translations: true,
          },
        },
      },
    });
  }
}

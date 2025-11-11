import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface LeadFilters {
  search?: string;
  month?: number;
  year?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class LeadRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find a lead by ID
   */
  async findById(id: string) {
    return this.prisma.lead.findUnique({
      where: { id },
    });
  }

  /**
   * Create a new lead
   */
  async create(data: {
    leadName: string;
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    reference: string;
    attachmentUrl?: string;
  }) {
    return this.prisma.lead.create({
      data,
    });
  }

  /**
   * Update an existing lead
   */
  async update(
    id: string,
    data: Partial<{
      leadName: string;
      clientName: string;
      clientPhone: string;
      clientEmail: string;
      reference: string;
      attachmentUrl: string;
    }>,
  ) {
    return this.prisma.lead.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a lead
   */
  async delete(id: string) {
    return this.prisma.lead.delete({
      where: { id },
    });
  }

  /**
   * Find all leads with filters and pagination
   */
  async findAllWithPagination(filters: LeadFilters): Promise<PaginatedResult<any>> {
    const where = this.buildWhereClause(filters);
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    // Execute count and data queries in parallel for better performance
    const [total, data] = await Promise.all([
      this.prisma.lead.count({ where }),
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { createdAt: 'desc' },
          { leadName: 'asc' },
        ],
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Check if a lead exists by ID
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.lead.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Check if a lead exists by client email (for duplicate detection)
   */
  async existsByClientEmail(email: string, excludeId?: string): Promise<boolean> {
    const count = await this.prisma.lead.count({
      where: {
        clientEmail: email,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
    return count > 0;
  }

  /**
   * Build the where clause for filtering
   */
  private buildWhereClause(filters: LeadFilters): Prisma.LeadWhereInput {
    const where: Prisma.LeadWhereInput = {};

    // Search by ID, lead name, or client name
    if (filters.search) {
      where.OR = [
        { id: { contains: filters.search } },
        { leadName: { contains: filters.search } },
        { clientName: { contains: filters.search } },
      ];
    }

    // Filter by month and year
    if (filters.year || filters.month) {
      const dateFilters = this.buildDateFilters(filters.year, filters.month);
      if (dateFilters) {
        where.createdAt = dateFilters;
      }
    }

    return where;
  }

  /**
   * Build date filters for month and year
   */
  private buildDateFilters(
    year?: number,
    month?: number,
  ): Prisma.DateTimeFilter | undefined {
    if (!year && !month) return undefined;

    const currentYear = year || new Date().getFullYear();

    if (month && month >= 1 && month <= 12) {
      // Filter by specific month and year
      const startDate = new Date(Date.UTC(currentYear, month - 1, 1, 0, 0, 0));
      const endDate = new Date(Date.UTC(currentYear, month, 0, 23, 59, 59, 999));

      return {
        gte: startDate,
        lte: endDate,
      };
    } else if (year) {
      // Filter by year only
      const startDate = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0));
      const endDate = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999));

      return {
        gte: startDate,
        lte: endDate,
      };
    }

    return undefined;
  }
}


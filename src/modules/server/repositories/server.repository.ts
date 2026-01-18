import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ServerStatus } from '../dto';

export interface ServerFilters {
  search?: string;
  projectId?: string;
  status?: ServerStatus;
  startMonth?: number;
  startYear?: number;
  endMonth?: number;
  endYear?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class ServerRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeRelations = {
    project: {
      select: {
        id: true,
        name: true,
        type: true,
      },
    },
  };

  /**
   * Find a server by ID
   */
  async findById(id: string) {
    return this.prisma.server.findUnique({
      where: { id },
      include: this.includeRelations,
    });
  }

  /**
   * Create a new server
   */
  async create(data: {
    projectId: string;
    contractNo: string;
    price: number;
    packageNum: string;
    startDate: Date;
    endDate: Date;
    attachmentUrl?: string;
  }) {
    return this.prisma.server.create({
      data,
      include: this.includeRelations,
    });
  }

  /**
   * Update an existing server
   */
  async update(
    id: string,
    data: Partial<{
      projectId: string;
      contractNo: string;
      price: number;
      packageNum: string;
      startDate: Date;
      endDate: Date;
      attachmentUrl: string | null;
    }>,
  ) {
    return this.prisma.server.update({
      where: { id },
      data,
      include: this.includeRelations,
    });
  }

  /**
   * Delete a server (hard delete)
   */
  async delete(id: string) {
    return this.prisma.server.delete({
      where: { id },
    });
  }

  /**
   * Find all servers with filters and pagination
   */
  async findAllWithPagination(filters: ServerFilters): Promise<PaginatedResult<any>> {
    const where = this.buildWhereClause(filters);
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    // Execute count and data queries in parallel for better performance
    const [total, data] = await Promise.all([
      this.prisma.server.count({ where }),
      this.prisma.server.findMany({
        where,
        include: this.includeRelations,
        skip,
        take: limit,
        orderBy: [{ createdAt: 'desc' }, { contractNo: 'asc' }],
      }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Check if a server exists by ID
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.server.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Build the where clause for filtering
   */
  private buildWhereClause(filters: ServerFilters): Prisma.ServerWhereInput {
    const where: Prisma.ServerWhereInput = {};

    // Search by contract number or package number
    if (filters.search) {
      where.OR = [
        { contractNo: { contains: filters.search } },
        { packageNum: { contains: filters.search } },
      ];
    }

    // Filter by project
    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    // Filter by status (active/expired)
    if (filters.status && filters.status !== ServerStatus.ALL) {
      const now = new Date();
      if (filters.status === ServerStatus.ACTIVE) {
        // Server is active: TODAY between startDate and endDate
        where.AND = [
          { startDate: { lte: now } },
          { endDate: { gte: now } },
        ];
      } else if (filters.status === ServerStatus.EXPIRED) {
        // Server is expired: TODAY > endDate
        where.endDate = { lt: now };
      }
    }

    // Filter by start date month and year
    if (filters.startYear || filters.startMonth) {
      const startDateFilters = this.buildDateFilters(filters.startYear, filters.startMonth);
      if (startDateFilters) {
        where.startDate = startDateFilters;
      }
    }

    // Filter by end date month and year
    if (filters.endYear || filters.endMonth) {
      const endDateFilters = this.buildDateFilters(filters.endYear, filters.endMonth);
      if (endDateFilters) {
        where.endDate = endDateFilters;
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


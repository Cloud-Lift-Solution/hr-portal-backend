import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma, ProjectType } from '@prisma/client';

export interface ProjectFilters {
  search?: string;
  type?: ProjectType;
  month?: number;
  year?: number;
  departmentId?: string;
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
export class ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeRelations = {
    department: {
      select: {
        id: true,
        name: true,
      },
    },
  };

  /**
   * Find a project by ID
   */
  async findById(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: this.includeRelations,
    });
  }

  /**
   * Create a new project
   */
  async create(data: {
    type: ProjectType;
    name: string;
    departmentId?: string;
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    clientCivilId?: string;
    contractDate: Date;
    contractNo: string;
    price: number;
    paymentMethod: any;
    worksDay: number;
    maintaince: number;
    paymentOnePercent?: number;
    paymentTwoPercent?: number;
    paymentThreePercent?: number;
    paymentFourPercent?: number;
    attachmentUrl?: string;
  }) {
    return this.prisma.project.create({
      data,
      include: this.includeRelations,
    });
  }

  /**
   * Update an existing project
   */
  async update(
    id: string,
    data: Partial<{
      type: ProjectType;
      name: string;
      departmentId: string | null;
      clientName: string;
      clientPhone: string;
      clientEmail: string;
      clientCivilId: string | null;
      contractDate: Date;
      contractNo: string;
      price: number;
      paymentMethod: any;
      worksDay: number;
      maintaince: number;
      paymentOnePercent: number | null;
      paymentTwoPercent: number | null;
      paymentThreePercent: number | null;
      paymentFourPercent: number | null;
      attachmentUrl: string | null;
    }>,
  ) {
    return this.prisma.project.update({
      where: { id },
      data,
      include: this.includeRelations,
    });
  }

  /**
   * Delete a project (hard delete)
   */
  async delete(id: string) {
    return this.prisma.project.delete({
      where: { id },
    });
  }

  /**
   * Find all projects with filters and pagination
   */
  async findAllWithPagination(filters: ProjectFilters): Promise<PaginatedResult<any>> {
    const where = this.buildWhereClause(filters);
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    // Execute count and data queries in parallel for better performance
    const [total, data] = await Promise.all([
      this.prisma.project.count({ where }),
      this.prisma.project.findMany({
        where,
        include: this.includeRelations,
        skip,
        take: limit,
        orderBy: [{ createdAt: 'desc' }, { name: 'asc' }],
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
   * Check if a project exists by ID
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.project.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Build the where clause for filtering
   */
  private buildWhereClause(filters: ProjectFilters): Prisma.ProjectWhereInput {
    const where: Prisma.ProjectWhereInput = {};

    // Search by project name (case-insensitive, partial match)
    if (filters.search) {
      where.name = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    // Filter by project type
    if (filters.type) {
      where.type = filters.type;
    }

    // Filter by department
    if (filters.departmentId) {
      where.departmentId = filters.departmentId;
    }

    // Filter by month and year (contract date)
    if (filters.year || filters.month) {
      const dateFilters = this.buildDateFilters(filters.year, filters.month);
      if (dateFilters) {
        where.contractDate = dateFilters;
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


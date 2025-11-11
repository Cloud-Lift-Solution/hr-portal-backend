import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AllowanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new allowance
   */
  async create(data: { name: string; fees: number }) {
    return this.prisma.allowance.create({
      data: {
        name: data.name,
        fees: data.fees,
      },
    });
  }

  /**
   * Find allowance by ID
   */
  async findById(id: string) {
    return this.prisma.allowance.findUnique({
      where: { id },
    });
  }

  /**
   * Find allowance by name (case-insensitive)
   */
  async findByName(name: string) {
    return this.prisma.allowance.findFirst({
      where: {
        name: {
          equals: name,
        },
      },
    });
  }

  /**
   * Find allowance by name excluding a specific ID (for update validation)
   */
  async findByNameExcludingId(name: string, excludeId: string) {
    return this.prisma.allowance.findFirst({
      where: {
        name: {
          equals: name,
        },
        id: {
          not: excludeId,
        },
      },
    });
  }

  /**
   * Update allowance
   */
  async update(
    id: string,
    data: Partial<{
      name: string;
      fees: number;
    }>,
  ) {
    return this.prisma.allowance.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete allowance
   */
  async delete(id: string) {
    return this.prisma.allowance.delete({
      where: { id },
    });
  }

  /**
   * Find all allowances with filters and pagination
   */
  async findAll(filters: {
    search?: string;
    sortBy: 'name' | 'fees' | 'createdAt';
    sortOrder: 'asc' | 'desc';
    page: number;
    limit: number;
  }) {
    const where: Prisma.AllowanceWhereInput = {};

    // Apply search filter
    if (filters.search) {
      where.name = {
        contains: filters.search,
      };
    }

    // Build orderBy
    const orderBy: Prisma.AllowanceOrderByWithRelationInput = {
      [filters.sortBy]: filters.sortOrder,
    };

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      this.prisma.allowance.findMany({
        where,
        orderBy,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.allowance.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Count allowances (useful for checking existence)
   */
  async count(where?: Prisma.AllowanceWhereInput): Promise<number> {
    return this.prisma.allowance.count({ where });
  }
}

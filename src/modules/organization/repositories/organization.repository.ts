import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrganizationRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create organization with additional names
   */
  async create(data: {
    name: string;
    additionalNames?: Array<{
      name: string;
      attachmentUrl?: string | null;
      order: number;
    }>;
  }) {
    return this.prisma.organization.create({
      data: {
        name: data.name,
        additionalNames: data.additionalNames
          ? {
              create: data.additionalNames,
            }
          : undefined,
      },
      include: {
        additionalNames: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  /**
   * Find organization by ID with additional names
   */
  async findById(id: string) {
    return this.prisma.organization.findUnique({
      where: { id },
      include: {
        additionalNames: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  /**
   * Find organization by name (case-insensitive)
   */
  async findByName(name: string, excludeId?: string) {
    return this.prisma.organization.findFirst({
      where: {
        name: {
          equals: name,
        },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
  }

  /**
   * Check if organization exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.organization.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Find all organizations with filters and pagination
   */
  async findAll(filters: {
    search?: string;
    sortBy: 'name' | 'createdAt';
    sortOrder: 'asc' | 'desc';
    page: number;
    limit: number;
  }) {
    const where: Prisma.OrganizationWhereInput = {};

    // Search in primary name or additional names
    if (filters.search) {
      where.OR = [
        {
          name: {
            contains: filters.search,
          },
        },
        {
          additionalNames: {
            some: {
              name: {
                contains: filters.search,
              },
            },
          },
        },
      ];
    }

    // Build orderBy
    const orderBy: Prisma.OrganizationOrderByWithRelationInput = {
      [filters.sortBy]: filters.sortOrder,
    };

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        include: {
          additionalNames: {
            orderBy: {
              order: 'asc',
            },
          },
        },
        orderBy,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.organization.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Update organization primary name
   */
  async update(id: string, data: { name?: string }) {
    return this.prisma.organization.update({
      where: { id },
      data,
      include: {
        additionalNames: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  /**
   * Replace all additional names for an organization
   * Deletes old names and creates new ones in a transaction
   */
  async replaceAdditionalNames(
    organizationId: string,
    names: Array<{
      name: string;
      attachmentUrl?: string | null;
      order: number;
    }>,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Delete all existing additional names
      await tx.organizationName.deleteMany({
        where: { organizationId },
      });

      // Create new additional names if any
      if (names.length > 0) {
        await tx.organizationName.createMany({
          data: names.map((name) => ({
            ...name,
            organizationId,
          })),
        });
      }

      // Return updated organization with new additional names
      return tx.organization.findUnique({
        where: { id: organizationId },
        include: {
          additionalNames: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      });
    });
  }

  /**
   * Delete organization (cascade deletes additional names)
   */
  async delete(id: string) {
    return this.prisma.organization.delete({
      where: { id },
    });
  }

  /**
   * Count organizations
   */
  async count(where?: Prisma.OrganizationWhereInput): Promise<number> {
    return this.prisma.organization.count({ where });
  }
}

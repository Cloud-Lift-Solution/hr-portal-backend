import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class DepartmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all departments with optional search and pagination
   */
  async findAll(search?: string, skip?: number, take?: number) {
    return this.prisma.department.findMany({
      where: search
        ? {
            name: {
              contains: search,
            },
          }
        : undefined,
      orderBy: {
        name: 'asc',
      },
      skip,
      take,
    });
  }

  /**
   * Count departments with optional search filter
   */
  async count(search?: string): Promise<number> {
    return this.prisma.department.count({
      where: search
        ? {
            name: {
              contains: search,
            },
          }
        : undefined,
    });
  }

  /**
   * Find department by ID
   */
  async findById(id: string) {
    return this.prisma.department.findUnique({
      where: { id },
    });
  }

  /**
   * Find department by name
   */
  async findByName(name: string) {
    return this.prisma.department.findFirst({
      where: { name },
    });
  }

  /**
   * Create department
   */
  async create(name: string) {
    return this.prisma.department.create({
      data: { name },
    });
  }

  /**
   * Update department
   */
  async update(id: string, name: string) {
    return this.prisma.department.update({
      where: { id },
      data: { name },
    });
  }

  /**
   * Delete department
   */
  async delete(id: string) {
    return this.prisma.department.delete({
      where: { id },
    });
  }

  /**
   * Check if department exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.department.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Check if department name exists (excluding specific department ID)
   */
  async nameExists(
    name: string,
    excludeDepartmentId?: string,
  ): Promise<boolean> {
    const count = await this.prisma.department.count({
      where: {
        name,
        ...(excludeDepartmentId && { id: { not: excludeDepartmentId } }),
      },
    });
    return count > 0;
  }
}

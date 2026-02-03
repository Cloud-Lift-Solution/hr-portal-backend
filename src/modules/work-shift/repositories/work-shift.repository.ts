import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class WorkShiftRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all work shifts with optional search
   */
  async findAll(search?: string) {
    return this.prisma.workShift.findMany({
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
    });
  }

  /**
   * Find work shift by ID
   */
  async findById(id: string) {
    return this.prisma.workShift.findUnique({
      where: { id },
    });
  }

  /**
   * Find work shift by name
   */
  async findByName(name: string) {
    return this.prisma.workShift.findFirst({
      where: { name },
    });
  }

  /**
   * Create work shift
   */
  async create(data: { name: string; clockIn: Date; clockOut: Date }) {
    return this.prisma.workShift.create({
      data,
    });
  }

  /**
   * Update work shift
   */
  async update(
    id: string,
    data: { name?: string; clockIn?: Date; clockOut?: Date },
  ) {
    return this.prisma.workShift.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete work shift
   */
  async delete(id: string) {
    return this.prisma.workShift.delete({
      where: { id },
    });
  }

  /**
   * Check if work shift exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.workShift.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Check if work shift name exists (excluding specific work shift ID)
   */
  async nameExists(
    name: string,
    excludeWorkShiftId?: string,
  ): Promise<boolean> {
    const count = await this.prisma.workShift.count({
      where: {
        name,
        ...(excludeWorkShiftId && { id: { not: excludeWorkShiftId } }),
      },
    });
    return count > 0;
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new company
   */
  async create(data: Prisma.CompanyCreateInput) {
    return this.prisma.company.create({
      data,
    });
  }

  /**
   * Find all companies with pagination
   */
  async findAll(skip: number, take: number) {
    return this.prisma.company.findMany({
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Count total companies
   */
  async count(): Promise<number> {
    return this.prisma.company.count();
  }

  /**
   * Find a company by ID
   */
  async findById(id: string) {
    return this.prisma.company.findUnique({
      where: { id },
    });
  }

  /**
   * Update a company
   */
  async update(id: string, data: Prisma.CompanyUpdateInput) {
    return this.prisma.company.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a company
   */
  async delete(id: string) {
    return this.prisma.company.delete({
      where: { id },
    });
  }
}

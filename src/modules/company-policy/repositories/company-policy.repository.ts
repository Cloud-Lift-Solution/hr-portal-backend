import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CompanyPolicyRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new company policy
   */
  async create(data: Prisma.CompanyPolicyCreateInput) {
    return this.prisma.companyPolicy.create({
      data,
    });
  }

  /**
   * Find all company policies with pagination
   */
  async findAll(skip: number, take: number) {
    return this.prisma.companyPolicy.findMany({
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Find policies by company ID
   */
  async findByCompanyId(companyId: string, skip: number, take: number) {
    return this.prisma.companyPolicy.findMany({
      where: { companyId },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Find policies by branch ID
   */
  async findByBranchId(branchId: string, skip: number, take: number) {
    return this.prisma.companyPolicy.findMany({
      where: { branchId },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Count total company policies
   */
  async count(): Promise<number> {
    return this.prisma.companyPolicy.count();
  }

  /**
   * Count policies by company ID
   */
  async countByCompanyId(companyId: string): Promise<number> {
    return this.prisma.companyPolicy.count({
      where: { companyId },
    });
  }

  /**
   * Count policies by branch ID
   */
  async countByBranchId(branchId: string): Promise<number> {
    return this.prisma.companyPolicy.count({
      where: { branchId },
    });
  }

  /**
   * Find a company policy by ID
   */
  async findById(id: string) {
    return this.prisma.companyPolicy.findUnique({
      where: { id },
    });
  }

  /**
   * Update a company policy
   */
  async update(id: string, data: Prisma.CompanyPolicyUpdateInput) {
    return this.prisma.companyPolicy.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a company policy
   */
  async delete(id: string) {
    return this.prisma.companyPolicy.delete({
      where: { id },
    });
  }
}

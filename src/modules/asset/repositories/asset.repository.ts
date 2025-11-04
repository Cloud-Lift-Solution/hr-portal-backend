import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AssetType } from '@prisma/client';

@Injectable()
export class AssetRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all assets with pagination
   */
  async findAll(skip: number = 0, take: number = 10) {
    return this.prisma.asset.findMany({
      skip,
      take,
      include: {
        categories: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Count total assets
   */
  async count(): Promise<number> {
    return this.prisma.asset.count();
  }

  /**
   * Find asset by ID with categories
   */
  async findById(id: string) {
    return this.prisma.asset.findUnique({
      where: { id },
      include: {
        categories: true,
      },
    });
  }

  /**
   * Find asset by serial number
   */
  async findBySerialNumber(serialNumber: string) {
    return this.prisma.asset.findFirst({
      where: { serialNumber },
      include: {
        categories: true,
      },
    });
  }

  /**
   * Create asset with categories in a transaction
   */
  async create(data: {
    name: string;
    type: AssetType;
    serialNumber?: string;
    categories?: { name: string }[];
  }) {
    return this.prisma.asset.create({
      data: {
        name: data.name,
        type: data.type,
        serialNumber: data.serialNumber,
        categories: data.categories
          ? {
              create: data.categories,
            }
          : undefined,
      },
      include: {
        categories: true,
      },
    });
  }

  /**
   * Update asset with categories
   */
  async update(
    id: string,
    data: {
      name?: string;
      serialNumber?: string;
      categories?: { name: string }[];
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Update basic asset fields
      const updateData: any = {};

      if (data.name !== undefined) {
        updateData.name = data.name;
      }

      if (data.serialNumber !== undefined) {
        updateData.serialNumber = data.serialNumber;
      }

      // Update asset if there are fields to update
      if (Object.keys(updateData).length > 0) {
        await tx.asset.update({
          where: { id },
          data: updateData,
        });
      }

      // Handle categories if provided
      if (data.categories) {
        // Delete existing categories
        await tx.assetCategory.deleteMany({
          where: { assetId: id },
        });

        // Create new categories
        await tx.assetCategory.createMany({
          data: data.categories.map((cat) => ({
            name: cat.name,
            assetId: id,
          })),
        });
      }

      // Return updated asset with categories
      return tx.asset.findUnique({
        where: { id },
        include: {
          categories: true,
        },
      });
    });
  }

  /**
   * Delete asset (categories will be cascade deleted)
   */
  async delete(id: string) {
    return this.prisma.asset.delete({
      where: { id },
    });
  }

  /**
   * Check if asset exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.asset.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Check if serial number exists (excluding specific asset ID)
   */
  async serialNumberExists(
    serialNumber: string,
    excludeAssetId?: string,
  ): Promise<boolean> {
    const count = await this.prisma.asset.count({
      where: {
        serialNumber,
        ...(excludeAssetId && { id: { not: excludeAssetId } }),
      },
    });
    return count > 0;
  }
}

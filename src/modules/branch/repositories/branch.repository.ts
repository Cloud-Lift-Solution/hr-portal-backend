import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class BranchRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Shared include used by every query that returns a branch
   */
  private readonly includeRelations = {
    translations: {
      include: {
        language: true,
      },
    },
    department: true,
    workShifts: {
      include: {
        workShift: true,
      },
    },
  };

  // ─── Queries ────────────────────────────────────────────────

  async findAll(skip?: number, take?: number) {
    return this.prisma.branch.findMany({
      include: this.includeRelations,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  async count(): Promise<number> {
    return this.prisma.branch.count();
  }

  async findById(id: string) {
    return this.prisma.branch.findUnique({
      where: { id },
      include: this.includeRelations,
    });
  }

  async findByDepartmentId(departmentId: string, skip?: number, take?: number) {
    return this.prisma.branch.findMany({
      where: { departmentId },
      include: this.includeRelations,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  async countByDepartmentId(departmentId: string): Promise<number> {
    return this.prisma.branch.count({ where: { departmentId } });
  }

  // ─── Mutations ──────────────────────────────────────────────

  async create(
    departmentId: string,
    openAnyTime: boolean,
    nameAr: string,
    nameEn: string,
    workShiftIds?: string[],
    latitude?: number,
    longitude?: number,
  ) {
    // Resolve language IDs
    const languages = await this.prisma.language.findMany({
      where: { code: { in: ['en', 'ar'] } },
    });

    const enLang = languages.find((l) => l.code === 'en');
    const arLang = languages.find((l) => l.code === 'ar');

    if (!enLang || !arLang) {
      throw new Error('Required languages (en, ar) not found in database');
    }

    return this.prisma.branch.create({
      data: {
        departmentId,
        openAnyTime,
        latitude,
        longitude,
        translations: {
          create: [
            { languageId: enLang.id, name: nameEn },
            { languageId: arLang.id, name: nameAr },
          ],
        },
        workShifts: workShiftIds?.length
          ? {
              create: workShiftIds.map((workShiftId) => ({ workShiftId })),
            }
          : undefined,
      },
      include: this.includeRelations,
    });
  }

  async update(
    id: string,
    data: {
      departmentId?: string;
      openAnyTime?: boolean;
      latitude?: number;
      longitude?: number;
      workShiftIds?: string[];
      nameAr?: string;
      nameEn?: string;
    },
  ) {
    const { nameAr, nameEn, workShiftIds, ...branchData } = data;

    // ── translations ──────────────────────────────────────────
    if (nameAr || nameEn) {
      const languages = await this.prisma.language.findMany({
        where: { code: { in: ['en', 'ar'] } },
      });

      const enLangId = languages.find((l) => l.code === 'en')?.id;
      const arLangId = languages.find((l) => l.code === 'ar')?.id;

      if (nameEn && enLangId) {
        await this.prisma.branchTranslation.upsert({
          where: { branchId_languageId: { branchId: id, languageId: enLangId } },
          update: { name: nameEn },
          create: { branchId: id, languageId: enLangId, name: nameEn },
        });
      }

      if (nameAr && arLangId) {
        await this.prisma.branchTranslation.upsert({
          where: { branchId_languageId: { branchId: id, languageId: arLangId } },
          update: { name: nameAr },
          create: { branchId: id, languageId: arLangId, name: nameAr },
        });
      }
    }

    // ── work shifts (replace all) ─────────────────────────────
    if (workShiftIds !== undefined) {
      // Delete all existing assignments for this branch
      await this.prisma.branchWorkShift.deleteMany({ where: { branchId: id } });

      // Re-create with the new list
      if (workShiftIds.length > 0) {
        await this.prisma.branchWorkShift.createMany({
          data: workShiftIds.map((workShiftId) => ({
            branchId: id,
            workShiftId,
          })),
        });
      }
    }

    // ── scalar fields ─────────────────────────────────────────
    return this.prisma.branch.update({
      where: { id },
      data: branchData,
      include: this.includeRelations,
    });
  }

  async delete(id: string) {
    return this.prisma.branch.delete({ where: { id } });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.branch.count({ where: { id } });
    return count > 0;
  }
}

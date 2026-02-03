import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class BranchRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all branches with translations and department info
   */
  async findAll(skip?: number, take?: number) {
    return this.prisma.branch.findMany({
      include: {
        translations: {
          include: {
            language: true,
          },
        },
        department: true,
        workShift: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    });
  }

  /**
   * Count all branches
   */
  async count(): Promise<number> {
    return this.prisma.branch.count();
  }

  /**
   * Find branch by ID with translations and department info
   */
  async findById(id: string) {
    return this.prisma.branch.findUnique({
      where: { id },
      include: {
        translations: {
          include: {
            language: true,
          },
        },
        department: true,
        workShift: true,
      },
    });
  }

  /**
   * Find branches by department ID
   */
  async findByDepartmentId(departmentId: string, skip?: number, take?: number) {
    return this.prisma.branch.findMany({
      where: { departmentId },
      include: {
        translations: {
          include: {
            language: true,
          },
        },
        department: true,
        workShift: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    });
  }

  /**
   * Count branches by department ID
   */
  async countByDepartmentId(departmentId: string): Promise<number> {
    return this.prisma.branch.count({
      where: { departmentId },
    });
  }

  /**
   * Create branch with translations
   */
  async create(
    departmentId: string,
    openAnyTime: boolean,
    nameAr: string,
    nameEn: string,
    workShiftId?: string,
  ) {
    // Get language IDs
    const languages = await this.prisma.language.findMany({
      where: {
        code: {
          in: ['en', 'ar'],
        },
      },
    });

    const enLang = languages.find((l) => l.code === 'en');
    const arLang = languages.find((l) => l.code === 'ar');

    if (!enLang || !arLang) {
      throw new Error('Required languages (en, ar) not found in database');
    }

    // Create branch with translations
    return this.prisma.branch.create({
      data: {
        departmentId,
        openAnyTime,
        workShiftId,
        translations: {
          create: [
            {
              languageId: enLang.id,
              name: nameEn,
            },
            {
              languageId: arLang.id,
              name: nameAr,
            },
          ],
        },
      },
      include: {
        translations: {
          include: {
            language: true,
          },
        },
        department: true,
        workShift: true,
      },
    });
  }

  /**
   * Update branch
   */
  async update(
    id: string,
    data: {
      departmentId?: string;
      openAnyTime?: boolean;
      workShiftId?: string;
      nameAr?: string;
      nameEn?: string;
    },
  ) {
    const { nameAr, nameEn, ...branchData } = data;

    // Get language IDs if translations need to be updated
    let enLangId: string | undefined;
    let arLangId: string | undefined;

    if (nameAr || nameEn) {
      const languages = await this.prisma.language.findMany({
        where: {
          code: {
            in: ['en', 'ar'],
          },
        },
      });

      enLangId = languages.find((l) => l.code === 'en')?.id;
      arLangId = languages.find((l) => l.code === 'ar')?.id;
    }

    // Update branch
    const updateData: any = {
      ...branchData,
    };

    // Update translations if provided
    if (nameEn && enLangId) {
      await this.prisma.branchTranslation.upsert({
        where: {
          branchId_languageId: {
            branchId: id,
            languageId: enLangId,
          },
        },
        update: {
          name: nameEn,
        },
        create: {
          branchId: id,
          languageId: enLangId,
          name: nameEn,
        },
      });
    }

    if (nameAr && arLangId) {
      await this.prisma.branchTranslation.upsert({
        where: {
          branchId_languageId: {
            branchId: id,
            languageId: arLangId,
          },
        },
        update: {
          name: nameAr,
        },
        create: {
          branchId: id,
          languageId: arLangId,
          name: nameAr,
        },
      });
    }

    return this.prisma.branch.update({
      where: { id },
      data: updateData,
      include: {
        translations: {
          include: {
            language: true,
          },
        },
        department: true,
        workShift: true,
      },
    });
  }

  /**
   * Delete branch
   */
  async delete(id: string) {
    return this.prisma.branch.delete({
      where: { id },
    });
  }

  /**
   * Check if branch exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.branch.count({
      where: { id },
    });
    return count > 0;
  }
}

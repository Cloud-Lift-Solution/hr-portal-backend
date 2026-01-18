import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class TicketCategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new ticket category with translations
   */
  async create(nameAr: string, nameEn: string) {
    return this.prisma.ticketCategory.create({
      data: {
        translations: {
          create: [
            { language: 'ar', name: nameAr },
            { language: 'en', name: nameEn },
          ],
        },
      },
      include: {
        translations: true,
      },
    });
  }

  /**
   * Find all ticket categories with translations
   */
  async findAll() {
    return this.prisma.ticketCategory.findMany({
      include: {
        translations: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Find ticket category by ID with translations
   */
  async findById(id: string) {
    return this.prisma.ticketCategory.findUnique({
      where: { id },
      include: {
        translations: true,
      },
    });
  }

  /**
   * Update ticket category translations
   */
  async update(id: string, nameAr?: string, nameEn?: string) {
    const updates = [];

    if (nameAr !== undefined) {
      updates.push(
        this.prisma.ticketCategoryTranslation.upsert({
          where: {
            categoryId_language: {
              categoryId: id,
              language: 'ar',
            },
          },
          update: { name: nameAr },
          create: {
            categoryId: id,
            language: 'ar',
            name: nameAr,
          },
        }),
      );
    }

    if (nameEn !== undefined) {
      updates.push(
        this.prisma.ticketCategoryTranslation.upsert({
          where: {
            categoryId_language: {
              categoryId: id,
              language: 'en',
            },
          },
          update: { name: nameEn },
          create: {
            categoryId: id,
            language: 'en',
            name: nameEn,
          },
        }),
      );
    }

    await Promise.all(updates);

    return this.findById(id);
  }

  /**
   * Delete ticket category
   */
  async delete(id: string) {
    return this.prisma.ticketCategory.delete({
      where: { id },
    });
  }
}

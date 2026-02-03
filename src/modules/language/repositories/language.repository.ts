import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class LanguageRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all languages
   */
  async findAll() {
    return this.prisma.language.findMany({
      orderBy: {
        code: 'asc',
      },
    });
  }

  /**
   * Find language by ID
   */
  async findById(id: string) {
    return this.prisma.language.findUnique({
      where: { id },
    });
  }

  /**
   * Find language by code
   */
  async findByCode(code: string) {
    return this.prisma.language.findUnique({
      where: { code },
    });
  }

  /**
   * Create language
   */
  async create(data: { code: string; name: string }) {
    return this.prisma.language.create({
      data,
    });
  }

  /**
   * Update language
   */
  async update(id: string, name: string) {
    return this.prisma.language.update({
      where: { id },
      data: { name },
    });
  }

  /**
   * Delete language
   */
  async delete(id: string) {
    return this.prisma.language.delete({
      where: { id },
    });
  }

  /**
   * Check if language exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.language.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Check if language code exists
   */
  async codeExists(code: string, excludeLanguageId?: string): Promise<boolean> {
    const count = await this.prisma.language.count({
      where: {
        code,
        ...(excludeLanguageId && { id: { not: excludeLanguageId } }),
      },
    });
    return count > 0;
  }
}

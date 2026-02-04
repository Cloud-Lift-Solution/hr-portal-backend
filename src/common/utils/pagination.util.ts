export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export class PaginationUtil {
  /**
   * Calculate skip value for database query
   */
  static getSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * Create pagination metadata
   */
  static createMeta(
    page: number,
    limit: number,
    total: number,
  ): PaginationMeta {
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Create paginated result
   */
  static createPaginatedResult<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
  ): PaginatedResult<T> {
    return {
      data,
      meta: this.createMeta(page, limit, total),
    };
  }

  /**
   * Validate and normalize page number
   */
  static normalizePage(page?: number): number {
    const normalizedPage = page && page > 0 ? page : 1;
    return normalizedPage;
  }

  /**
   * Validate and normalize limit
   */
  static normalizeLimit(limit?: number, maxLimit: number = 100): number {
    if (!limit || limit <= 0) {
      return 20; // Default limit
    }
    return Math.min(limit, maxLimit);
  }

  /**
   * Parse pagination query parameters from strings to numbers
   * Handles empty strings and invalid values gracefully
   */
  static parseParams(
    pageParam?: string,
    limitParam?: string,
  ): { page?: number; limit?: number } {
    return {
      page: pageParam ? parseInt(pageParam, 10) : undefined,
      limit: limitParam ? parseInt(limitParam, 10) : undefined,
    };
  }
}

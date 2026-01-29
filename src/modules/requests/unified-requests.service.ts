import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  RequestType,
  UnifiedRequestDto,
  PaginatedUnifiedRequestsDto,
} from './dto';

@Injectable()
export class UnifiedRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyRequests(
    employeeId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedUnifiedRequestsDto> {
    const skip = (page - 1) * limit;

    // Fetch all request types in parallel for better performance
    const [
      vacations,
      sickLeaves,
      vacationExtensions,
      vacationCancellations,
      salaryAdvances,
      salaryCertificates,
    ] = await Promise.all([
      // Vacation requests
      this.prisma.vacation.findMany({
        where: { employeeId },
        select: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          departureDay: true,
          returnDay: true,
          numberOfDays: true,
          reason: true,
          type: true,
          description: true,
          attachmentUrls: true,
        },
      }),

      // Sick leave requests
      this.prisma.sickLeave.findMany({
        where: { employeeId },
        select: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          departureDay: true,
          returnDay: true,
          numberOfDays: true,
          reason: true,
          attachmentUrls: true,
        },
      }),

      // Vacation extension requests
      this.prisma.vacationExtensionRequest.findMany({
        where: {
          vacation: { employeeId },
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          extendToDate: true,
          additionalDays: true,
          description: true,
          attachmentUrls: true,
          vacation: {
            select: {
              id: true,
              departureDay: true,
              returnDay: true,
              reason: true,
              type: true,
              numberOfDays: true,
            },
          },
        },
      }),

      // Vacation cancellation requests
      this.prisma.vacationCancellationRequest.findMany({
        where: {
          vacation: { employeeId },
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          description: true,
          attachmentUrls: true,
          vacation: {
            select: {
              id: true,
              departureDay: true,
              returnDay: true,
              reason: true,
              type: true,
              numberOfDays: true,
            },
          },
        },
      }),

      // Salary advance requests
      this.prisma.salaryAdvanceRequest.findMany({
        where: { employeeId },
        select: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          month: true,
          year: true,
          description: true,
        },
      }),

      // Salary certificate requests
      this.prisma.salaryCertificateRequest.findMany({
        where: { employeeId },
        select: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          reason: true,
          description: true,
        },
      }),
    ]);

    // Transform each type to unified format
    const unifiedRequests: UnifiedRequestDto[] = [
      ...vacations.map((v) => ({
        id: v.id,
        type: RequestType.VACATION,
        status: v.status,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
        data: {
          departureDay: v.departureDay,
          returnDay: v.returnDay,
          numberOfDays: v.numberOfDays,
          reason: v.reason,
          type: v.type,
          description: v.description,
          attachmentUrls: Array.isArray(v.attachmentUrls)
            ? v.attachmentUrls
            : [],
        },
      })),

      ...sickLeaves.map((s) => ({
        id: s.id,
        type: RequestType.SICK_LEAVE,
        status: s.status,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        data: {
          departureDay: s.departureDay,
          returnDay: s.returnDay,
          numberOfDays: s.numberOfDays,
          reason: s.reason,
          attachmentUrls: Array.isArray(s.attachmentUrls)
            ? s.attachmentUrls
            : [],
        },
      })),

      ...vacationExtensions.map((e) => ({
        id: e.id,
        type: RequestType.VACATION_EXTENSION,
        status: e.status,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
        data: {
          vacation: e.vacation,
          extendToDate: e.extendToDate,
          additionalDays: e.additionalDays,
          description: e.description,
          attachmentUrls: Array.isArray(e.attachmentUrls)
            ? e.attachmentUrls
            : [],
        },
      })),

      ...vacationCancellations.map((c) => ({
        id: c.id,
        type: RequestType.VACATION_CANCELLATION,
        status: c.status,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        data: {
          vacation: c.vacation,
          description: c.description,
          attachmentUrls: Array.isArray(c.attachmentUrls)
            ? c.attachmentUrls
            : [],
        },
      })),

      ...salaryAdvances.map((a) => ({
        id: a.id,
        type: RequestType.SALARY_ADVANCE,
        status: a.status,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        data: {
          month: a.month,
          year: a.year,
          description: a.description,
        },
      })),

      ...salaryCertificates.map((c) => ({
        id: c.id,
        type: RequestType.SALARY_CERTIFICATE,
        status: c.status,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        data: {
          reason: c.reason,
          description: c.description,
        },
      })),
    ];

    // Sort by createdAt descending (newest first)
    unifiedRequests.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    // Get total count
    const total = unifiedRequests.length;

    // Apply pagination
    const paginatedItems = unifiedRequests.slice(skip, skip + limit);

    return {
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

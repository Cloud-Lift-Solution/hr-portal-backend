import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { WorkShiftRepository } from './repositories/work-shift.repository';
import {
  CreateWorkShiftDto,
  UpdateWorkShiftDto,
  WorkShiftResponseDto,
} from './dto';
import { TranslatedException } from '../../common/exceptions/business.exception';

@Injectable()
export class WorkShiftService {
  private readonly logger = new Logger(WorkShiftService.name);

  constructor(
    private readonly workShiftRepository: WorkShiftRepository,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Get all work shifts with optional search
   */
  async findAll(search?: string): Promise<WorkShiftResponseDto[]> {
    const workShifts = await this.workShiftRepository.findAll(search);
    return workShifts.map((shift) => this.formatResponse(shift));
  }

  /**
   * Get single work shift by ID
   */
  async findOne(id: string): Promise<WorkShiftResponseDto> {
    const workShift = await this.workShiftRepository.findById(id);

    if (!workShift) {
      throw TranslatedException.notFound('workShift.notFound');
    }

    return this.formatResponse(workShift);
  }

  /**
   * Create new work shift
   */
  async create(
    createWorkShiftDto: CreateWorkShiftDto,
    lang: string,
  ): Promise<WorkShiftResponseDto> {
    // Check if name already exists
    await this.validateNameUniqueness(createWorkShiftDto.name, lang);

    // Convert time strings to Date objects
    const clockIn = this.parseTimeToDate(createWorkShiftDto.clockIn);
    const clockOut = this.parseTimeToDate(createWorkShiftDto.clockOut);

    // Create work shift
    const workShift = await this.workShiftRepository.create({
      name: createWorkShiftDto.name,
      clockIn,
      clockOut,
    });

    return this.formatResponse(workShift);
  }

  /**
   * Update existing work shift
   */
  async update(
    id: string,
    updateWorkShiftDto: UpdateWorkShiftDto,
    lang: string,
  ): Promise<WorkShiftResponseDto> {
    // Check if work shift exists
    await this.ensureWorkShiftExists(id);

    // Check if name already exists (if name is being updated)
    if (updateWorkShiftDto.name) {
      await this.validateNameUniqueness(updateWorkShiftDto.name, lang, id);
    }

    // Build update data
    const updateData: {
      name?: string;
      clockIn?: Date;
      clockOut?: Date;
    } = {};

    if (updateWorkShiftDto.name) {
      updateData.name = updateWorkShiftDto.name;
    }

    if (updateWorkShiftDto.clockIn) {
      updateData.clockIn = this.parseTimeToDate(updateWorkShiftDto.clockIn);
    }

    if (updateWorkShiftDto.clockOut) {
      updateData.clockOut = this.parseTimeToDate(updateWorkShiftDto.clockOut);
    }

    // Update work shift
    const updatedWorkShift = await this.workShiftRepository.update(
      id,
      updateData,
    );

    return this.formatResponse(updatedWorkShift);
  }

  /**
   * Delete work shift
   */
  async remove(id: string, lang: string): Promise<{ message: string }> {
    // Check if work shift exists
    await this.ensureWorkShiftExists(id);

    // Delete work shift
    await this.workShiftRepository.delete(id);

    return {
      message: await this.i18n.translate('workShift.deleteSuccess', { lang }),
    };
  }

  /**
   * Ensure work shift exists or throw error
   */
  private async ensureWorkShiftExists(id: string): Promise<void> {
    const exists = await this.workShiftRepository.exists(id);
    if (!exists) {
      throw TranslatedException.notFound('workShift.notFound');
    }
  }

  /**
   * Validate work shift name uniqueness
   */
  private async validateNameUniqueness(
    name: string,
    lang: string,
    excludeWorkShiftId?: string,
  ): Promise<void> {
    const exists = await this.workShiftRepository.nameExists(
      name,
      excludeWorkShiftId,
    );

    if (exists) {
      throw new ConflictException(
        this.i18n.translate('workShift.nameExists', { lang }),
      );
    }
  }

  /**
   * Parse time string (HH:mm:ss) to Date object
   */
  private parseTimeToDate(timeString: string): Date {
    // Create a date with the time component
    // MySQL TIME type doesn't need a date, but Prisma uses Date object
    const date = new Date();
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    date.setHours(hours, minutes, seconds, 0);
    return date;
  }

  /**
   * Format work shift response to include time as string
   */
  private formatResponse(workShift: any): WorkShiftResponseDto {
    return {
      id: workShift.id,
      name: workShift.name,
      clockIn: this.formatTimeFromDate(workShift.clockIn),
      clockOut: this.formatTimeFromDate(workShift.clockOut),
      createdAt: workShift.createdAt,
      updatedAt: workShift.updatedAt,
    };
  }

  /**
   * Format Date to time string (HH:mm:ss)
   */
  private formatTimeFromDate(date: Date): string {
    if (typeof date === 'string') return date;
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }
}

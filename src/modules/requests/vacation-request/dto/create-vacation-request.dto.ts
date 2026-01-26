import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsArray,
  IsUrl,
  Min,
} from 'class-validator';
import { VacationReason, VacationType } from '@prisma/client';

export class CreateVacationRequestDto {
  @IsDateString()
  departureDay: string;

  @IsDateString()
  returnDay: string;

  @IsInt()
  @Min(1)
  numberOfDays: number;

  @IsEnum(VacationReason)
  reason: VacationReason;

  @IsEnum(VacationType)
  type: VacationType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  attachmentUrls?: string[];
}

import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsArray,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateSickLeaveRequestDto {
  @IsDateString()
  departureDay: string;

  @IsDateString()
  returnDay: string;

  @IsInt()
  @Min(1)
  numberOfDays: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  attachmentUrls?: string[];
}

import {
  IsDateString,
  IsOptional,
  IsString,
  IsArray,
  IsUrl,
  IsUUID,
} from 'class-validator';

export class CreateVacationExtensionRequestDto {
  @IsUUID()
  vacationId: string;

  @IsDateString()
  extendToDate: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  attachmentUrls?: string[];
}

import {
  IsOptional,
  IsString,
  IsArray,
  IsUrl,
  IsUUID,
} from 'class-validator';

export class CreateVacationCancellationRequestDto {
  @IsUUID()
  vacationId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  attachmentUrls?: string[];
}

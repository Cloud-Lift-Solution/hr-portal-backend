import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateRemoteWorkRequestDto {
  @IsDateString()
  requestDate: string; // ISO date string for the date employee wants to work remotely

  @IsOptional()
  @IsString()
  description?: string;
}

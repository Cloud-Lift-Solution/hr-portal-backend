import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCompanyDto {
  @ApiProperty({ example: 'Syntax Maker Company', required: false })
  @IsString()
  @IsOptional()
  legalName?: string;

  @ApiProperty({ example: '123456789012', required: false })
  @IsString()
  @IsOptional()
  civilId?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  authorisedSignatory?: string;

  @ApiProperty({ example: '2020-01-15', required: false })
  @IsDateString()
  @IsOptional()
  establishmentDate?: string;

  @ApiProperty({ example: 'Ahmed Al-Mansouri', required: false })
  @IsString()
  @IsOptional()
  owner?: string;

  @ApiProperty({ example: 'Block 5, Street 12, Building 45, Kuwait City', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'Leading software development company', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '+96512345678', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: '+96512345679', required: false })
  @IsString()
  @IsOptional()
  faxNumber?: string;

  @ApiProperty({ example: 'LIC-2020-12345', required: false })
  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @ApiProperty({ example: 'CR-2020-98765', required: false })
  @IsString()
  @IsOptional()
  commercialRegistration?: string;

  @ApiProperty({ example: 'Legal Office LLC', required: false })
  @IsString()
  @IsOptional()
  legalOffice?: string;
}

import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Syntax Maker Company' })
  @IsString()
  legalName: string;

  @ApiProperty({ example: '123456789012' })
  @IsString()
  civilId: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  authorisedSignatory: string;

  @ApiProperty({ example: '2020-01-15', required: false })
  @IsDateString()
  @IsOptional()
  establishmentDate?: string;

  @ApiProperty({ example: 'Ahmed Al-Mansouri' })
  @IsString()
  owner: string;

  @ApiProperty({ example: 'Block 5, Street 12, Building 45, Kuwait City' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'Leading software development company' })
  @IsString()
  description: string;

  @ApiProperty({ example: '+96512345678', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: '+96512345679', required: false })
  @IsString()
  @IsOptional()
  faxNumber?: string;

  @ApiProperty({ example: 'LIC-2020-12345' })
  @IsString()
  licenseNumber: string;

  @ApiProperty({ example: 'CR-2020-98765' })
  @IsString()
  commercialRegistration: string;

  @ApiProperty({ example: 'Legal Office LLC' })
  @IsString()
  legalOffice: string;
}

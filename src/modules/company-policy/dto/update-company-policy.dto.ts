import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCompanyPolicyDto {
  @ApiProperty({ example: 'Remote Work Policy', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'Updated policy description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'https://s3.amazonaws.com/bucket/policy.pdf', required: false })
  @IsString()
  @IsOptional()
  fileUrl?: string;

  @ApiProperty({ example: 'uuid-of-company', required: false })
  @IsUUID()
  @IsOptional()
  companyId?: string;

  @ApiProperty({ example: 'uuid-of-branch', required: false })
  @IsUUID()
  @IsOptional()
  branchId?: string;
}

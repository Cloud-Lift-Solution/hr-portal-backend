import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyPolicyDto {
  @ApiProperty({ example: 'Remote Work Policy' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Policy description detailing remote work guidelines and requirements' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'https://s3.amazonaws.com/bucket/policy.pdf', required: false })
  @IsString()
  @IsOptional()
  fileUrl?: string;

  @ApiProperty({ example: 'uuid-of-company' })
  @IsUUID()
  companyId: string;

  @ApiProperty({ example: 'uuid-of-branch', required: false })
  @IsUUID()
  @IsOptional()
  branchId?: string;
}

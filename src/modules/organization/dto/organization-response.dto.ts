import { ApiProperty } from '@nestjs/swagger';

export class AdditionalNameResponseDto {
  @ApiProperty({ description: 'Additional name ID' })
  id: string;

  @ApiProperty({ description: 'Additional name' })
  name: string;

  @ApiProperty({ description: 'Attachment URL', nullable: true })
  attachmentUrl: string | null;

  @ApiProperty({ description: 'Display order' })
  order: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class OrganizationResponseDto {
  @ApiProperty({ description: 'Organization ID' })
  id: string;

  @ApiProperty({ description: 'Primary organization name' })
  name: string;

  @ApiProperty({
    description: 'Additional organization names',
    type: [AdditionalNameResponseDto],
  })
  additionalNames: AdditionalNameResponseDto[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class DeleteOrganizationResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;
}


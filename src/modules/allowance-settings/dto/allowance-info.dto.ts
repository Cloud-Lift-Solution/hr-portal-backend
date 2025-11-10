import { ApiProperty } from '@nestjs/swagger';

export class AllowanceInfoDto {
  @ApiProperty({ description: 'Allowance ID' })
  id: string;

  @ApiProperty({ description: 'Allowance name' })
  name: string;

  @ApiProperty({ description: 'Allowance amount' })
  fees: number;
}


import { ApiProperty } from '@nestjs/swagger';
import { EmployeeInfoDto } from './employee-info.dto';
import { AuthTokensDto } from './auth-tokens.dto';

export class LoginResponseDto {
  @ApiProperty({ description: 'Employee information', type: EmployeeInfoDto })
  user: EmployeeInfoDto;

  @ApiProperty({ description: 'Authentication tokens', type: AuthTokensDto })
  tokens: AuthTokensDto;
}

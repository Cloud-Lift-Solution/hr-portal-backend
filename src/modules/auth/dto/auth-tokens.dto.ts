import { ApiProperty } from '@nestjs/swagger';

export class TokenDto {
  @ApiProperty({ description: 'JWT token' })
  token: string;

  @ApiProperty({ description: 'Token expiration date' })
  expires: Date;
}

export class AuthTokensDto {
  @ApiProperty({ description: 'Access token', type: TokenDto })
  access: TokenDto;

  @ApiProperty({
    description: 'Refresh token',
    type: TokenDto,
    required: false,
  })
  refresh?: TokenDto;
}

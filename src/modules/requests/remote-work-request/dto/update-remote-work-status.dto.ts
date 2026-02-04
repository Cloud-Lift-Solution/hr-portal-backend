import { IsEnum } from 'class-validator';
import { RemoteWorkStatus } from '@prisma/client';

export class UpdateRemoteWorkStatusDto {
  @IsEnum(RemoteWorkStatus)
  status: RemoteWorkStatus;
}

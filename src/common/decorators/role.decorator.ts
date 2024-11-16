import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';

export function PrivateService() {
  return applyDecorators(UseGuards(AuthGuard), ApiBearerAuth('access-token'));
}

export const necessaryRole = (...necessaryRole: string[]) =>
  SetMetadata('necessaryRole', necessaryRole);

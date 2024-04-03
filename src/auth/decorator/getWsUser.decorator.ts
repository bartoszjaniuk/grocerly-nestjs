import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { UserFromJwtDto } from '../dto/userFromJwtDto';

export const GetWsUser = createParamDecorator(
  (_, ctx: ExecutionContext): UserFromJwtDto => {
    const client = ctx.switchToWs().getClient().handshake;
    return client.user;
  },
);

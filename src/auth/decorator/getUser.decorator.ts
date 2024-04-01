import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { UserFromJwtDto } from '../dto/userFromJwtDto';

export const GetUser = createParamDecorator(
  (_, ctx: ExecutionContext): UserFromJwtDto => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

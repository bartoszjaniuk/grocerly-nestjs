import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export class WsAuthGuard extends AuthGuard('ws') {
  constructor() {
    super();
  }
  // DO I NEED THAT?
  getRequest(context: ExecutionContext) {
    return context.switchToWs().getClient().handshake;
  }
}

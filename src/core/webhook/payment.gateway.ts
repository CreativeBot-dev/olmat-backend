import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class PaymentGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join-payment')
  joinPaymentRoom(
    @MessageBody() invoice: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`payment:${invoice}`);
  }

  emitPaymentPaid(invoice: string) {
    this.server.to(`payment:${invoice}`).emit('payment-paid', {
      invoice,
      status: 'paid',
    });
  }
}

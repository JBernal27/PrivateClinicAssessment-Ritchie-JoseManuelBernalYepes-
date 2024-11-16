import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AppointmentService } from 'src/appointment/appointment.service';

@WebSocketGateway()
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly appointmentService: AppointmentService) {}

  @WebSocketServer()
  server: Server;

  private static intervalId: NodeJS.Timeout;

  handleConnection(client: Socket) {
    console.log('Client connected', client.id);

    if (this.server.engine.clientsCount > 0 && !WebsocketGateway.intervalId) {
      WebsocketGateway.intervalId = setInterval(() => {
        this.emitConstantData();
      }, 2000);
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected', client.id);

    if (this.server.engine.clientsCount === 0) {
      clearInterval(WebsocketGateway.intervalId);
      WebsocketGateway.intervalId = null;
    }
  }

  private async emitConstantData() {
    const doctors = await this.appointmentService.getAvailableDoctors();
    this.server.emit('avaliableDoctors', doctors);
  }
}

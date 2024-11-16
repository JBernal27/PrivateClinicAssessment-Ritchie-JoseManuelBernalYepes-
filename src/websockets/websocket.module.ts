import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { AppointmentModule } from 'src/appointment/appointment.module';
import { AppointmentService } from 'src/appointment/appointment.service';
import { Appointment } from 'src/appointment/entities/appointment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Appointment]),
    AppointmentModule,
    UsersModule,
  ],
  providers: [WebsocketGateway, UsersService, AppointmentService],
})
export class GatewayModule {}

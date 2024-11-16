import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import CreateUsers from './users.seed';
import CreateAppointments from './appointments.seed';

@Injectable()
export class SeedService {
  constructor(private readonly dataSource: DataSource) {}

  async seed() {
    const userSeeders = new CreateUsers();
    await userSeeders.run(this.dataSource);

    const appointmentsSeeders = new CreateAppointments();
    await appointmentsSeeders.run(this.dataSource);
  }
}

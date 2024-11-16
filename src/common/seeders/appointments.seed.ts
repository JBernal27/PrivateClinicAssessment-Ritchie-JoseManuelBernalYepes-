import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Roles } from 'src/common/enums/roles.enum';
import { addHour, addMinute } from '@formkit/tempo';
import { Appointment } from 'src/appointment/entities/appointment.entity';

export default class CreateAppointments implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const appointmentRepository = dataSource.getRepository(Appointment);
    const userRepository = dataSource.getRepository(User);
    const startDate = new Date('2024-11-18T08:00:00');

    const doctors = await userRepository.find({
      where: { role: Roles.DOCTOR },
    });

    const patients = await userRepository.find({
      where: { role: Roles.PATIENT },
    });

    const appointmentsData = [];

    const reasons = [
      'Routine checkup',
      'Follow-up on previous treatment',
      'Consultation for new symptoms',
      'Annual health exam',
      'Specialist consultation',
    ];

    const descriptions = [
      'Patient needs an overall health check.',
      'Follow-up on chronic condition management.',
      'Consulting for recent symptoms and concerns.',
      'Annual physical exam to assess general health.',
      'Specialist consultation for heart health.',
    ];

    let counter = 0;
    for (const doctor of doctors) {
      for (let i = 0; i < 5; i++) {
        const patient = patients[Math.floor(Math.random() * patients.length)];
        const appointmentStart = addHour(startDate, counter * 2);
        const appointmentEnd = addMinute(appointmentStart, 59);
        const reason = reasons[Math.floor(Math.random() * reasons.length)];
        const description =
          descriptions[Math.floor(Math.random() * descriptions.length)];

        appointmentsData.push({
          patient: patient,
          doctor: doctor,
          startDate: appointmentStart,
          endDate: appointmentEnd,
          reason: reason,
          description: description,
          specialty: doctor.specialty,
          created_by: 1,
          updated_by: 1,
        });

        counter++;
      }
    }

    for (const appointment of appointmentsData) {
      const existingAppointment = await appointmentRepository.findOne({
        where: {
          startDate: appointment.startDate,
          doctor: { id: appointment.doctor.id },
        },
      });

      if (!existingAppointment) {
        const newAppointment = appointmentRepository.create(appointment);
        await appointmentRepository.save(newAppointment);
      }
    }

    console.log('Appointments created');
  }
}

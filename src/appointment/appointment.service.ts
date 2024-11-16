import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment } from './entities/appointment.entity';
import { User } from 'src/users/entities/user.entity';
import { Roles } from 'src/common/enums/roles.enum';
import { addMinute, date, diffMinutes } from '@formkit/tempo';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private async checkAppointmentTime(appointmentStartDate: Date) {
    const currentDate = new Date();

    const differenceInMinutes = diffMinutes(
      currentDate,
      appointmentStartDate,
      'trunc',
    );

    if (
      date(appointmentStartDate) < date(currentDate) ||
      Math.abs(differenceInMinutes) < 15
    ) {
      throw new ConflictException(
        'You can only createor modify an appointment at least 15 minutes before it starts',
      );
    }
  }

  async create(
    createAppointmentDto: CreateAppointmentDto,
    creatorUserId: number,
  ): Promise<Appointment> {
    const { patient_id, doctor_id, startDate, reason, description, specialty } =
      createAppointmentDto;

    if (patient_id === doctor_id) {
      throw new BadRequestException('Patient and Doctor cannot be the same');
    }

    const patient = await this.userRepository.findOne({
      where: { id: patient_id },
    });
    const doctor = await this.userRepository.findOne({
      where: { id: doctor_id, role: Roles.DOCTOR },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (doctor.specialty !== specialty) {
      throw new NotFoundException(
        'This doctor is not assigned to this specialty',
      );
    }

    await this.checkAppointmentTime(startDate);

    const endDate = addMinute(startDate, 59);

    const existingAppointment = await this.appointmentRepository.findOne({
      where: {
        doctor: { id: doctor.id },
        startDate: LessThanOrEqual(endDate),
        endDate: MoreThanOrEqual(startDate),
      },
    });

    if (existingAppointment) {
      throw new ConflictException(
        'This doctor is already scheduled for the selected date and time',
      );
    }

    const appointment = this.appointmentRepository.create({
      patient,
      doctor,
      startDate,
      endDate,
      reason,
      description,
      specialty,
      created_by: creatorUserId,
      updated_by: creatorUserId,
    });

    await this.appointmentRepository.save(appointment);

    return await this.findById(appointment.id, creatorUserId);
  }

  async findAll(
    startDate?: string,
    endDate?: string,
    specialty?: string,
    reason?: string,
    userId?: number,
    ownAppointments?: boolean,
  ): Promise<Appointment[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const queryBuilder = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.doctor', 'doctor');

    if (user.role === Roles.PATIENT) {
      queryBuilder.andWhere('(patient.id = :userId)', {
        userId,
      });
    } else if (
      (user.role === Roles.DOCTOR || user.role === Roles.ADMIN) &&
      ownAppointments
    ) {
      queryBuilder.andWhere('(doctor.id = :userId OR patient.id = :userId)', {
        userId,
      });
    }

    console.log(user.role, ownAppointments);

    if (startDate) {
      queryBuilder.andWhere('appointment.startDate >= :startDate', {
        startDate,
      });
    }

    if (endDate) {
      queryBuilder.andWhere('appointment.endDate <= :endDate', { endDate });
    }

    if (specialty) {
      queryBuilder.andWhere('doctor.specialty = :specialty', { specialty });
    }

    if (reason) {
      queryBuilder.andWhere('appointment.reason LIKE :reason', {
        reason: `%${reason}%`,
      });
    }

    const appointments = await queryBuilder.getMany();

    appointments.forEach((appointment) => {
      delete appointment.patient.password;
      delete appointment.doctor.password;
    });

    return appointments;
  }

  async findById(id: number, userId: number): Promise<Appointment> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (user.role === Roles.PATIENT && appointment.patient.id !== userId) {
      throw new ForbiddenException('You can only access your own appointments');
    }

    delete appointment.patient.password;
    delete appointment.doctor.password;

    return appointment;
  }

  async update(
    id: number,
    updateAppointmentDto: UpdateAppointmentDto,
    userId?: number,
  ): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      appointment.patient.id !== userId &&
      appointment.doctor.id !== userId &&
      user.role !== Roles.ADMIN
    ) {
      throw new ForbiddenException(
        'You do not have permission to update this appointment',
      );
    }

    const { doctor_id, specialty, startDate } = updateAppointmentDto;

    if (startDate) {
      await this.checkAppointmentTime(startDate);
    }

    if (doctor_id) {
      const newDoctor = await this.userRepository.findOne({
        where: { id: doctor_id, role: Roles.DOCTOR },
      });

      if (!newDoctor) {
        throw new NotFoundException('The new doctor was not found');
      }

      if (specialty && newDoctor.specialty !== specialty) {
        throw new BadRequestException(
          'The new doctor does not match the required specialty',
        );
      }

      if (!specialty && newDoctor.specialty !== appointment.specialty) {
        throw new BadRequestException(
          'The new doctor does not match the current specialty of the appointment',
        );
      }

      appointment.doctor = newDoctor;
    }

    if (specialty && !doctor_id) {
      if (appointment.doctor.specialty !== specialty) {
        throw new BadRequestException(
          'The current doctor does not match the new specialty',
        );
      }

      appointment.specialty = specialty;
    }

    Object.assign(appointment, updateAppointmentDto);

    appointment.updated_by = userId;
    return await this.appointmentRepository.save(appointment);
  }

  async remove(id: number, userId?: number): Promise<void> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (
      appointment.patient.id !== userId &&
      appointment.doctor.id !== userId &&
      user.role !== Roles.ADMIN
    ) {
      throw new ForbiddenException(
        'You do not have permission to cancel this appointment',
      );
    }

    await this.checkAppointmentTime(appointment.startDate);

    appointment.isDeleted = true;

    await this.appointmentRepository.save(appointment);
  }

  async getAvailableDoctors(): Promise<User[]> {
    const now = new Date();

    const startDate = new Date(now.setMinutes(0, 0, 0));

    const endDate = addMinute(startDate, 59);

    const appointments = await this.appointmentRepository.find({
      where: {
        startDate: LessThanOrEqual(endDate),
        endDate: MoreThanOrEqual(startDate),
      },
      relations: ['doctor'],
    });

    const occupiedDoctorIds = appointments.map(
      (appointment) => appointment.doctor.id,
    );

    const allDoctors = await this.userRepository.find({
      where: { role: Roles.DOCTOR },
    });

    return allDoctors.filter(
      (doctor) => !occupiedDoctorIds.includes(doctor.id),
    );
  }

  async findHistory(id: number, userId: number): Promise<Appointment[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const appointments = await this.appointmentRepository.find({
      where: { patient: { id: id } },
      relations: ['patient', 'doctor'],
    });

    if (appointments.length === 0) {
      throw new NotFoundException('This patient has no appointments');
    }

    appointments.forEach((appointment) => {
      delete appointment.patient.password;
      delete appointment.doctor.password;
    });

    return appointments;
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { MedicalSpecialty } from 'src/common/enums/specialities.enum';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('appointments')
export class Appointment {
  @ApiProperty({
    description: 'Unique identifier for the appointment',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Patient who requested the appointment',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.appointmentsAsPatient, { eager: true })
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @ApiProperty({
    description: 'Doctor assigned for the appointment',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.appointmentsAsDoctor, { eager: true })
  @JoinColumn({ name: 'doctor_id' })
  doctor: User;

  @ApiProperty({
    description: 'Date and time for the appointment',
    example: '2024-11-15T10:00:00.000Z',
  })
  @Column({ type: 'timestamp' })
  startDate: Date;

  @ApiProperty({
    description: 'Date and time for the appointment',
    example: '2024-11-15T10:00:00.000Z',
  })
  @Column({ type: 'timestamp' })
  endDate: Date;

  @ApiProperty({
    description: 'Reason for the appointment',
    example: 'Annual checkup',
  })
  @Column()
  reason: string;

  @ApiProperty({
    description: 'Detailed description of the appointment',
    example:
      'Patient wants to discuss overall health and possible prescriptions.',
  })
  @Column()
  description: string;

  @ApiProperty({
    description: 'Specialty of the doctor handling the appointment',
    example: 'General Medicine',
  })
  @Column()
  specialty: MedicalSpecialty;

  @ApiProperty({
    description: 'ID of the user who created the appointment',
    example: 1,
  })
  @Column()
  created_by: number;

  @ApiProperty({
    description: 'ID of the user who last updated the appointment',
    example: 2,
  })
  @Column()
  updated_by: number;

  @ApiProperty({
    description: 'Timestamp when the appointment was created',
    example: '2024-11-15T10:00:00.000Z',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ApiProperty({
    description: 'Timestamp when the appointment was last updated',
    example: '2024-11-15T10:00:00.000Z',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ApiProperty({
    description: 'Indicates if the appointment is deleted',
    example: false,
  })
  @Column({ default: false })
  isDeleted: boolean;
}

import { ApiProperty } from '@nestjs/swagger';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { Roles } from 'src/common/enums/roles.enum';
import { MedicalSpecialty } from 'src/common/enums/specialities.enum';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'The document number of the user, must be unique',
    example: 123456789,
  })
  @Column({ unique: true })
  doc_number: number;

  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
  })
  @Column({ unique: true })
  name: string;

  @ApiProperty({
    description: 'The email address of the user, must be unique',
    example: 'john.doe@example.com',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    description: 'The hashed password of the user',
    example: '$2b$10$Vv6/FXgtv0SuF2cX/IYmQeS2yzFvTSc4ATzC54oV02r0w0C2L4Yy',
  })
  @Column()
  password: string;

  @ApiProperty({
    description: 'The role of the user',
    example: 'admin',
  })
  @Column()
  role: Roles;

  @ApiProperty({
    description: 'The specialty of the doctor',
    example: 'General Medicine',
    nullable: true,
  })
  @Column({ nullable: true })
  specialty: MedicalSpecialty;

  @OneToMany(() => Appointment, (appointment) => appointment.patient)
  appointmentsAsPatient: Appointment[];

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  appointmentsAsDoctor: Appointment[];

  @ApiProperty({
    description: 'The created at date of the user',
    example: '2022-01-01T00:00:00.000Z',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ApiProperty({
    description: 'The updated at date of the user',
    example: '2022-01-01T00:00:00.000Z',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ApiProperty({
    description: 'Indicates if the user is deleted',
    example: false,
  })
  @Column({ default: false })
  isDeleted: boolean;
}

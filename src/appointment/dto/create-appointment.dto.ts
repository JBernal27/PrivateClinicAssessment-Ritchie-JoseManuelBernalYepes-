import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';
import { MedicalSpecialty } from 'src/common/enums/specialities.enum';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'ID of the patient who is making the appointment',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  patient_id: number;

  @ApiProperty({
    description: 'ID of the doctor assigned for the appointment',
    example: 2,
  })
  @IsInt()
  @IsNotEmpty()
  doctor_id: number;

  @ApiProperty({
    description:
      'Scheduled date and time for the appointment (in Colombia local time, UTC-5).',
    example: '2024-11-15T10:00:00.000',
  })
  @IsDateString()
  @IsNotEmpty()
  @Matches(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.\d{3}$/, {
    message:
      'The date must be in Colombia local time format (e.g., 2024-11-15T10:00:00.000), which is UTC-5.',
  })
  // @Matches(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):00:00\.\d{3}$/, {
  //   message: 'The time must be on the hour (e.g., 01:00:00.000, 02:00:00.000).',
  // })
  startDate: Date;

  @ApiProperty({
    description: 'Reason for the appointment',
    example: 'General health check-up',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({
    description: 'Detailed description of the appointment',
    example:
      'Patient needs a routine check-up and consultation about blood pressure.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Medical specialty of the doctor handling the appointment',
    enum: MedicalSpecialty,
    example: 'General Medicine',
  })
  @IsEnum(MedicalSpecialty)
  @IsNotEmpty()
  specialty: MedicalSpecialty;
}

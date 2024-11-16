import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  MinLength,
} from 'class-validator';
import { Roles } from 'src/common/enums/roles.enum';
import { MedicalSpecialty } from 'src/common/enums/specialities.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'The document number of the user, must be unique',
    example: 123456789,
  })
  @IsNotEmpty({ message: 'Document number cannot be empty.' })
  @IsNumber({}, { message: 'Document number must be a number.' })
  doc_number: number;

  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string.' })
  name?: string;

  @ApiProperty({
    description: 'The email address of the user, must be unique',
    example: 'john.doe@example.com',
    nullable: true,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid format.' })
  email?: string;

  @ApiProperty({
    description: 'The hashed password of the user',
    example: '$2b$10$Vv6/FXgtv0SuF2cX/IYmQeS2yzFvTSc4ATzC54oV02r0w0C2L4Yy',
  })
  @IsNotEmpty({ message: 'Password cannot be empty.' })
  @IsString({ message: 'Password must be a string.' })
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  password: string;

  @ApiProperty({
    description: 'The role of the user',
    example: 'admin',
    nullable: true,
  })
  @IsOptional()
  @IsEnum(Roles, {
    message:
      'Role must be one of the allowed values: admin, personnel, or doctor.',
  })
  role?: Roles;

  @ApiProperty({
    description: 'The specialty of the doctor',
    example: 'General Medicine',
    nullable: true,
  })
  @IsOptional()
  @IsEnum(MedicalSpecialty, {
    message: 'Medical specialty must be one of the allowed options.',
  })
  specialty?: MedicalSpecialty;
}

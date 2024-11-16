import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import {
  necessaryRole,
  PrivateService,
} from 'src/common/decorators/role.decorator';
import { Roles } from 'src/common/enums/roles.enum';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { Appointment } from './entities/appointment.entity';

@ApiTags('Appointments')
@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @PrivateService()
  @Post()
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({
    status: 201,
    description: 'Appointment created successfully.',
    type: Appointment,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request, invalid data or parameters.',
  })
  create(@Body() createAppointmentDto: CreateAppointmentDto, @Request() req) {
    return this.appointmentService.create(createAppointmentDto, req.user.id);
  }

  @PrivateService()
  @Get()
  @ApiOperation({ summary: 'Retrieve all appointments' })
  @ApiResponse({
    status: 200,
    description: 'List of all appointments.',
    type: [Appointment],
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters.',
  })
  findAll(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('specialty') specialty?: string,
    @Query('reason') reason?: string,
    @Query('ownAppointments') ownAppointments?: boolean,
  ) {
    return this.appointmentService.findAll(
      startDate,
      endDate,
      specialty,
      reason,
      req.user.id,
      ownAppointments,
    );
  }

  @PrivateService()
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve an appointment by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the appointment to retrieve',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Appointment details',
    type: Appointment,
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment not found',
  })
  findOne(@Param('id') id: string, @Request() req) {
    return this.appointmentService.findById(+id, req.user.id);
  }

  @PrivateService()
  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing appointment' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the appointment to update',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Appointment updated successfully.',
    type: Appointment,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or parameters.',
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment not found',
  })
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @Request() req,
  ) {
    return this.appointmentService.update(
      +id,
      updateAppointmentDto,
      req.user.id,
    );
  }

  @PrivateService()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an appointment by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the appointment to delete',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Appointment deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment not found',
  })
  remove(@Param('id') id: string, @Request() req) {
    return this.appointmentService.remove(+id, req.user.id);
  }

  @PrivateService()
  @necessaryRole(Roles.DOCTOR)
  @Get('history/:id')
  @ApiOperation({ summary: 'Retrieve the appointment history for a patient' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the patient whose appointment history is requested',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'List of appointments for the patient',
    type: [Appointment],
  })
  @ApiResponse({
    status: 404,
    description: 'No appointments found for the patient',
  })
  findHistory(@Param('id') id: string, @Request() req) {
    return this.appointmentService.findHistory(+id, req.user.id);
  }
}

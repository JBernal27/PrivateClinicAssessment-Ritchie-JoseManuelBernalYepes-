import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { Roles } from 'src/common/enums/roles.enum';
import { MedicalSpecialty } from 'src/common/enums/specialities.enum';

export default class CreateUsers implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);

    const usersData = [
      {
        name: 'Admin',
        doc_number: 123456,
        password: bcrypt.hashSync('admin1', 10),
        email: 'admin@correo.com',
        role: Roles.ADMIN,
      },
      {
        name: 'Patient',
        doc_number: 654321,
        password: bcrypt.hashSync('patient1', 10),
        email: 'patient@correo.com',
        role: Roles.PATIENT,
      },
      {
        name: 'Dr. Smith',
        doc_number: 111222,
        password: bcrypt.hashSync('medico1', 10),
        email: 'dr.smith@correo.com',
        role: Roles.DOCTOR,
        specialty: MedicalSpecialty.GENERAL_MEDICINE,
      },
      {
        name: 'Dr. Johnson',
        doc_number: 333444,
        password: bcrypt.hashSync('medico2', 10),
        email: 'dr.johnson@correo.com',
        role: Roles.DOCTOR,
        specialty: MedicalSpecialty.CARDIOLOGY,
      },
      {
        name: 'Patient2',
        doc_number: 654327,
        password: bcrypt.hashSync('patient2', 10),
        email: 'patient2@correo.com',
        role: Roles.PATIENT,
      },
    ];

    for (const user of usersData) {
      const userExists = await userRepository.findOneBy({
        doc_number: user.doc_number,
      });

      if (!userExists) {
        console.log('Creating user:', user.name);
        const newUser = userRepository.create(user);
        await userRepository.save(newUser);
      }
    }

    console.log('Users created');
  }
}

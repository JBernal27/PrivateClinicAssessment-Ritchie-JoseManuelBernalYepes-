import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Roles } from 'src/common/enums/roles.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    if (createUserDto.role === Roles.DOCTOR) {
      if (!createUserDto.specialty) {
        throw new BadRequestException('Specialty is required');
      }
    }
    if (createUserDto.role != Roles.DOCTOR) {
      if (createUserDto.specialty) {
        throw new BadRequestException('Specialty is only allowed for doctors');
      }
    }
    createUserDto.email = createUserDto.email.toLowerCase();
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.userRepository.save(createUserDto);
    delete user.password;
    return user;
  }
  async findAll() {
    return this.userRepository.find();
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async findOne(id: number, user: User) {
    if (user.id !== id && user.role !== Roles.ADMIN) {
      throw new BadRequestException('You can only access your own data');
    }
    return this.userRepository.findOne({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto, user: User) {
    if (user.id !== id && user.role !== Roles.ADMIN) {
      throw new BadRequestException('You can only update your own data');
    }

    if (updateUserDto.doc_number && user.role !== Roles.ADMIN) {
      throw new BadRequestException(
        'Only an admin can update the document number',
      );
    }

    if (updateUserDto.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new BadRequestException('Email is already in use');
      }
    }

    await this.userRepository.update(id, updateUserDto);

    return this.userRepository.findOne({ where: { id } });
  }

  async remove(id: number, user: User) {
    if (user.id !== id && user.role !== Roles.ADMIN) {
      throw new BadRequestException('You can only delete your own data');
    }
    await this.userRepository.update(id, { isDeleted: true });
    return this.userRepository.findOne({ where: { id } });
  }
}

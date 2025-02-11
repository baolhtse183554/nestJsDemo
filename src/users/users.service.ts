import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // Check if the email already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll() {
    const users = await this.usersRepository.find({
      relations: ['addresses'],
      select: {
        id: true,
        name: true,
        email: true,
        addresses: {
          id: true,
          street: true,
          city: true
        }
      }
    });

    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      addresses: user.addresses.map(address => ({
        id: address.id,
        address: `${address.street}, ${address.city}`
      })),
    }));
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['addresses'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      addresses: user.addresses.map(address => ({
        id: address.id,
        address: `${address.street}, ${address.city}`,
      })),
    };
  }

  async remove(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.usersRepository.remove(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    Object.assign(user, updateUserDto);

    return this.usersRepository.save(user);
  }
}
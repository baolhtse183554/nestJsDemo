import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { User } from '../users/entities/user.entity';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private addressesRepository: Repository<Address>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createAddressDto: CreateAddressDto) {
    const existingAddress = await this.addressesRepository.findOne({
      where: {
        street: createAddressDto.street,
        city: createAddressDto.city,
        userId: createAddressDto.userId
      }
    });

    if (existingAddress) {
      throw new ConflictException('Address already exists for this user.');
    }

    const user = await this.usersRepository.findOne({
      where: { id: createAddressDto.userId }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${createAddressDto.userId} not found`);
    }

    const address = this.addressesRepository.create({
      ...createAddressDto,
      user
    });

    return this.addressesRepository.save(address);
  }

  async findAll() {
    const addresses = await this.addressesRepository
      .createQueryBuilder('address')
      .leftJoinAndSelect('address.user', 'user')
      .select([
        'address.id',
        'address.street',
        'address.city',
        'address.userId',
        'user.id',
        'user.name'
      ])
      .getMany();

    return addresses.map(address => ({
      id: address.id,
      address: `${address.street}, ${address.city}`,
      user: {
        id: address.user.id,
        name: address.user.name
      }
    }));
  }

  async findOne(id: number) {
    const address = await this.addressesRepository
      .createQueryBuilder('address')
      .leftJoinAndSelect('address.user', 'user')
      .select([
        'address.id',
        'address.street',
        'address.city',
        'address.userId',
        'user.id',
        'user.name'
      ])
      .where('address.id = :id', { id })
      .getOne();

    if (!address) {
      throw new NotFoundException(`Address #${id} not found`);
    }

    return {
      id: address.id,
      address: `${address.street}, ${address.city}`,
      user: {
        id: address.user.id,
        name: address.user.name
      }
    };
  }

  async remove(id: number) {
    const address = await this.addressesRepository.findOne({
      where: { id }
    });

    if (!address) {
      throw new NotFoundException(`Address #${id} not found`);
    }

    return this.addressesRepository.remove(address);
  }

  async update(id: number, updateAddressDto: UpdateAddressDto) {
    const address = await this.addressesRepository
      .createQueryBuilder('address')
      .leftJoinAndSelect('address.user', 'user')
      .where('address.id = :id', { id })
      .getOne();

    if (!address) {
      throw new NotFoundException(`Address #${id} not found`);
    }

    if (updateAddressDto.userId) {
      const user = await this.usersRepository.findOne({
        where: { id: updateAddressDto.userId }
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${updateAddressDto.userId} not found`);
      }
      address.user = user;
    }

    Object.assign(address, updateAddressDto);

    const updatedAddress = await this.addressesRepository.save(address);
    
    return {
      id: updatedAddress.id,
      address: `${updatedAddress.street}, ${updatedAddress.city}`,
      user: {
        id: updatedAddress.user.id,
        name: updatedAddress.user.name
      }
    };
  }
}
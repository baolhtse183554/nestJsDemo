import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { User } from '../users/entities/user.entity';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Address, User])
  ],
  providers: [AddressesService],
  controllers: [AddressesController]
})
export class AddressesModule {}
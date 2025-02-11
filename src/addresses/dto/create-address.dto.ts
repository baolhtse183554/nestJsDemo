import { IsString, IsNumber } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsNumber()
  userId: number;
}
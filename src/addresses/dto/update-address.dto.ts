import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateAddressDto {
  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsNumber()
  @IsOptional()
  userId?: number;
}

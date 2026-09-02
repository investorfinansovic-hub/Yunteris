import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  serviceId: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  optionIds?: string[];

  @IsString()
  address: string;

  @IsString()
  district: string;

  @IsDateString()
  scheduledAt: string;
}

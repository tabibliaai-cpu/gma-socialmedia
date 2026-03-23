import { IsUUID, IsNumber, IsOptional, IsObject, IsDateString } from 'class-validator';

export class CreateOrderDto {
  @IsUUID()
  customerId: string;

  @IsOptional()
  @IsUUID()
  dealId?: string;

  @IsNumber()
  totalAmount: number;

  @IsOptional()
  @IsObject()
  details?: Record<string, any>;
}

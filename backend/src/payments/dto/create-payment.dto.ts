import { IsNumber, IsString, IsOptional, IsIn, Min } from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsString()
  @IsIn(['chat', 'subscription', 'affiliate', 'article', 'ad'])
  type: string;

  @IsOptional()
  @IsString()
  referenceId?: string;
}

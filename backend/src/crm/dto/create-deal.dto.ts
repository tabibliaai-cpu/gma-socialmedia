import { IsString, IsOptional, IsNumber, IsUUID, IsDateString } from 'class-validator';

export class CreateDealDto {
  @IsOptional()
  @IsUUID()
  leadId?: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsNumber()
  value?: number;

  @IsOptional()
  @IsDateString()
  expectedCloseDate?: string;
}

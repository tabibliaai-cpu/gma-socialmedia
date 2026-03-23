import { IsString, IsOptional, IsIn, IsUUID } from 'class-validator';

export class CreateLeadDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsString()
  @IsIn(['ad', 'chat', 'organic', 'referral'])
  source: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

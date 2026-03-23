import { IsString, IsNumber, IsOptional, IsIn, IsUrl, Min } from 'class-validator';

export class CreateAdDto {
  @IsString()
  @IsIn(['feed', 'comment', 'profile'])
  type: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  mediaUrl?: string;

  @IsUrl()
  targetUrl: string;

  @IsNumber()
  @Min(100)
  budget: number;

  @IsOptional()
  targeting?: Record<string, any>;
}

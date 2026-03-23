import { IsString, IsOptional, IsBoolean, IsNumber, IsUrl, MinLength } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @MinLength(5)
  title: string;

  @IsString()
  @MinLength(50)
  content: string;

  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @IsOptional()
  @IsNumber()
  price?: number;
}

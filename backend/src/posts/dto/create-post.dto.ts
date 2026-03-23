import { IsString, IsOptional, IsIn, IsUrl, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  caption?: string;

  @IsOptional()
  @IsUrl()
  media_url?: string;

  @IsOptional()
  @IsIn(['image', 'video'])
  media_type?: string;
}

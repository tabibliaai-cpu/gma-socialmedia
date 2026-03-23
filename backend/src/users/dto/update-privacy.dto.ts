import { IsOptional, IsIn } from 'class-validator';

export class UpdatePrivacyDto {
  @IsOptional()
  @IsIn(['everyone', 'selected', 'none'])
  name_visibility?: string;

  @IsOptional()
  @IsIn(['everyone', 'selected', 'none'])
  dm_permission?: string;

  @IsOptional()
  @IsIn(['username', 'name', 'both', 'hidden'])
  search_visibility?: string;
}

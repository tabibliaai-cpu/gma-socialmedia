import { IsString, IsOptional, IsIn } from 'class-validator';

export class SendMessageDto {
  @IsString()
  senderId: string;

  @IsString()
  receiverId: string;

  @IsString()
  encryptedMessage: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsOptional()
  @IsIn(['text', 'image', 'video'])
  messageType?: string;

  @IsOptional()
  isPaid?: boolean;
}

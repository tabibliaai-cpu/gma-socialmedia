import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  async getConversations(@Request() req) {
    return this.chatService.getConversations(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversation/:userId')
  async getConversation(
    @Request() req,
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.chatService.getConversation(req.user.id, userId, +page, +limit);
  }

  @UseGuards(JwtAuthGuard)
  @Post('block/:userId')
  async blockUser(@Request() req, @Param('userId') userId: string) {
    return this.chatService.blockUser(req.user.id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('nuclear-block/:userId')
  async nuclearBlock(@Request() req, @Param('userId') userId: string) {
    return this.chatService.nuclearBlock(req.user.id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('block/:userId')
  async unblockUser(@Request() req, @Param('userId') userId: string) {
    return this.chatService.unblockUser(req.user.id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('paid-settings')
  async setPaidChatSettings(
    @Request() req,
    @Body('price') price: number,
    @Body('enabled') enabled: boolean,
  ) {
    return this.chatService.setPaidChatSettings(req.user.id, price, enabled);
  }

  @UseGuards(JwtAuthGuard)
  @Post('unlock/:creatorId')
  async unlockChat(
    @Request() req,
    @Param('creatorId') creatorId: string,
    @Body('amount') amount: number,
    @Body('paymentId') paymentId: string,
  ) {
    return this.chatService.unlockChat(req.user.id, creatorId, amount, paymentId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('message/:messageId')
  async deleteMessage(@Request() req, @Param('messageId') messageId: string) {
    return this.chatService.deleteMessage(req.user.id, messageId);
  }
}

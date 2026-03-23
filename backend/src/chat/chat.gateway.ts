import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub;
      client.data.email = payload.email;
      client.data.role = payload.role;

      this.connectedUsers.set(payload.sub, client.id);

      // Join user's personal room for direct messages
      client.join(`user:${payload.sub}`);

      // Notify contacts that user is online
      this.server.emit('user:online', { userId: payload.sub });

      console.log(`User connected: ${payload.sub}`);
    } catch (error) {
      console.error('Connection error:', error.message);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.connectedUsers.delete(userId);
      this.server.emit('user:offline', { userId });
      console.log(`User disconnected: ${userId}`);
    }
  }

  @SubscribeMessage('message:send')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string; encryptedMessage: string; mediaUrl?: string; messageType?: string },
  ) {
    const senderId = client.data.userId;

    try {
      // Check if chat is unlocked (for paid chats)
      const canChat = await this.chatService.canSendMessage(senderId, data.receiverId);
      
      if (!canChat.allowed) {
        client.emit('message:error', { 
          error: canChat.reason,
          requiresPayment: canChat.requiresPayment,
          price: canChat.price,
        });
        return;
      }

      // Save message to database
      const message = await this.chatService.saveMessage({
        senderId,
        receiverId: data.receiverId,
        encryptedMessage: data.encryptedMessage,
        mediaUrl: data.mediaUrl,
        messageType: data.messageType || 'text',
      });

      // Emit to receiver's room
      this.server.to(`user:${data.receiverId}`).emit('message:receive', {
        ...message,
        senderId,
      });

      // Confirm to sender
      client.emit('message:sent', message);

      // Trigger AI auto-reply if enabled
      await this.chatService.triggerAutoReply(data.receiverId, senderId, message.id);

      return message;
    } catch (error) {
      client.emit('message:error', { error: error.message });
    }
  }

  @SubscribeMessage('typing:start')
  async handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string },
  ) {
    this.server.to(`user:${data.receiverId}`).emit('typing:start', {
      userId: client.data.userId,
    });
  }

  @SubscribeMessage('typing:stop')
  async handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string },
  ) {
    this.server.to(`user:${data.receiverId}`).emit('typing:stop', {
      userId: client.data.userId,
    });
  }

  @SubscribeMessage('message:read')
  async handleMessageRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { senderId: string },
  ) {
    await this.chatService.markMessagesAsRead(client.data.userId, data.senderId);
    
    this.server.to(`user:${data.senderId}`).emit('message:read', {
      by: client.data.userId,
    });
  }

  getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  isUserOnline(userId: string) {
    return this.connectedUsers.has(userId);
  }
}

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      const allowed = process.env.FRONTEND_URL || 'http://localhost:3000';
      if (!origin || origin === allowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn(`Connection rejected - no token (socket: ${client.id})`);
        client.disconnect();
        return;
      }

      const secret = this.configService.get<string>('JWT_SECRET') || 'super-secret-key';
      const payload = this.jwtService.verify(token, { secret });

      client.data.userId = payload.sub;
      client.data.email = payload.email;
      client.data.role = payload.role;

      // Remove any stale mapping for this userId before re-adding
      this.connectedUsers.set(payload.sub, client.id);

      // Join user's personal room for direct messages
      client.join(`user:${payload.sub}`);

      // Only notify relevant contacts, not broadcast to everyone
      client.broadcast.emit('user:online', { userId: payload.sub });

      this.logger.log(`User connected: ${payload.sub} (socket: ${client.id})`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data?.userId;
    if (userId) {
      this.connectedUsers.delete(userId);
      client.broadcast.emit('user:offline', { userId });
      this.logger.log(`User disconnected: ${userId}`);
    }
  }

  @SubscribeMessage('message:send')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      receiverId: string;
      encryptedMessage: string;
      mediaUrl?: string;
      messageType?: string;
    },
  ) {
    const senderId = client.data?.userId;

    if (!senderId) {
      client.emit('message:error', { error: 'Not authenticated' });
      return;
    }

    if (!data?.receiverId || !data?.encryptedMessage) {
      client.emit('message:error', { error: 'Missing receiverId or message content' });
      return;
    }

    try {
      const canChat = await this.chatService.canSendMessage(senderId, data.receiverId);

      if (!canChat.allowed) {
        client.emit('message:error', {
          error: canChat.reason,
          requiresPayment: canChat.requiresPayment,
          price: canChat.price,
        });
        return;
      }

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

      // Trigger AI auto-reply if enabled (non-blocking)
      this.chatService.triggerAutoReply(data.receiverId, senderId, message.id).catch((err) =>
        this.logger.error(`Auto-reply error: ${err.message}`),
      );

      return message;
    } catch (error) {
      this.logger.error(`Message send error: ${error.message}`);
      client.emit('message:error', { error: error.message });
    }
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string },
  ) {
    if (!data?.receiverId) return;
    this.server.to(`user:${data.receiverId}`).emit('typing:start', {
      userId: client.data?.userId,
    });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string },
  ) {
    if (!data?.receiverId) return;
    this.server.to(`user:${data.receiverId}`).emit('typing:stop', {
      userId: client.data?.userId,
    });
  }

  @SubscribeMessage('message:read')
  async handleMessageRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { senderId: string },
  ) {
    const userId = client.data?.userId;
    if (!userId || !data?.senderId) return;

    await this.chatService.markMessagesAsRead(userId, data.senderId);

    this.server.to(`user:${data.senderId}`).emit('message:read', {
      by: userId,
    });
  }

  getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  isUserOnline(userId: string) {
    return this.connectedUsers.has(userId);
  }
}

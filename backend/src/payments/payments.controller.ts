import { Controller, Post, Get, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateOrderDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-order')
  async createOrder(@Request() req, @Body() dto: CreateOrderDto) {
    return this.paymentsService.createOrder(req.user.id, dto);
  }

  @Post('verify')
  async verifyPayment(
    @Body('razorpay_order_id') orderId: string,
    @Body('razorpay_payment_id') paymentId: string,
    @Body('razorpay_signature') signature: string,
  ) {
    return this.paymentsService.verifyPayment({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('transactions')
  async getTransactions(@Request() req, @Query('type') type?: string) {
    return this.paymentsService.getTransactions(req.user.id, type);
  }

  @UseGuards(JwtAuthGuard)
  @Get('earnings')
  async getEarnings(@Request() req) {
    return this.paymentsService.getEarnings(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refund/:transactionId')
  async refundPayment(@Request() req, @Param('transactionId') transactionId: string) {
    return this.paymentsService.refundPayment(transactionId);
  }
}

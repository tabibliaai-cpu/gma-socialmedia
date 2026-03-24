import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Razorpay = require('razorpay');
import { SupabaseService } from '../common/supabase/supabase.service';
import { CreateOrderDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  private razorpay: any;

  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get('RAZORPAY_KEY_ID'),
      key_secret: this.configService.get('RAZORPAY_KEY_SECRET'),
    });
  }

  async createOrder(userId: string, dto: CreateOrderDto) {
    const options = {
      amount: dto.amount * 100, // Razorpay expects paise
      currency: dto.currency || 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId,
        type: dto.type,
        referenceId: dto.referenceId || '',
      },
    };

    const order = await this.razorpay.orders.create(options);

    // Save transaction
    await this.supabaseService.from('transactions').insert({
      user_id: userId,
      amount: dto.amount,
      currency: dto.currency || 'INR',
      type: dto.type,
      status: 'pending',
      razorpay_order_id: order.id,
      metadata: { referenceId: dto.referenceId },
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: this.configService.get('RAZORPAY_KEY_ID'),
    };
  }

  async verifyPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    const crypto = await import('crypto');
    
    const body = data.razorpay_order_id + '|' + data.razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', this.configService.get('RAZORPAY_KEY_SECRET') || '')
      .update(body.toString())
      .digest('hex');

    const isValid = expectedSignature === data.razorpay_signature;

    if (!isValid) {
      throw new Error('Invalid payment signature');
    }

    // Update transaction
    const { data: transaction, error } = await this.supabaseService
      .from('transactions')
      .update({
        status: 'completed',
        razorpay_payment_id: data.razorpay_payment_id,
      })
      .eq('razorpay_order_id', data.razorpay_order_id)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update transaction');
    }

    // Handle specific payment types
    if (transaction) {
      await this.handlePaymentSuccess(transaction);
    }

    return {
      success: true,
      transaction,
    };
  }

  private async handlePaymentSuccess(transaction: any) {
    const { type, metadata } = transaction;

    switch (type) {
      case 'chat':
        // Unlock chat
        if (metadata?.referenceId) {
          await this.supabaseService.from('chat_unlocks').insert({
            payer_id: transaction.user_id,
            creator_id: metadata.referenceId,
            amount: transaction.amount,
          });
        }
        break;

      case 'article':
        // Unlock article
        if (metadata?.referenceId) {
          await this.supabaseService.from('article_purchases').insert({
            article_id: metadata.referenceId,
            user_id: transaction.user_id,
            amount: transaction.amount,
          });
        }
        break;

      case 'affiliate':
        // Create affiliate
        if (metadata?.referenceId) {
          // Logic to create affiliate relationship
        }
        break;

      case 'subscription':
        // Create subscription
        if (metadata?.referenceId) {
          await this.supabaseService.from('subscriptions').insert({
            creator_id: metadata.referenceId,
            subscriber_id: transaction.user_id,
            plan_type: metadata.planType || 'monthly',
            amount: transaction.amount,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          });
        }
        break;

      case 'ad':
        // Credit ad budget
        if (metadata?.referenceId) {
          await this.supabaseService
            .from('ads')
            .update({ budget: this.supabaseService.rpc('increment_budget', { amount: transaction.amount }) })
            .eq('id', metadata.referenceId);
        }
        break;
    }
  }

  async getTransactions(userId: string, type?: string) {
    let query = this.supabaseService
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) throw new Error('Failed to get transactions');
    return data;
  }

  async getEarnings(userId: string) {
    // Get all earnings for creators
    const { data: transactions, error } = await this.supabaseService
      .from('transactions')
      .select('*')
      .in('type', ['chat', 'article', 'subscription'])
      .eq('status', 'completed');

    if (error) throw new Error('Failed to get earnings');

    // Calculate earnings where user is the recipient
    const earnings = {
      total: 0,
      chat: 0,
      articles: 0,
      subscriptions: 0,
      thisMonth: 0,
    };

    // This is simplified - in production you'd join with the actual records
    return earnings;
  }

  async refundPayment(transactionId: string) {
    const { data: transaction } = await this.supabaseService
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (!transaction || !transaction.razorpay_payment_id) {
      throw new Error('Transaction not found');
    }

    const refund = await this.razorpay.payments.refund(transaction.razorpay_payment_id, {});

    await this.supabaseService
      .from('transactions')
      .update({ status: 'refunded' })
      .eq('id', transactionId);

    return refund;
  }
}

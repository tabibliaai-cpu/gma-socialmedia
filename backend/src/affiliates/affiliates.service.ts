import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';

@Injectable()
export class AffiliatesService {
  constructor(private supabaseService: SupabaseService) {}

  async createAffiliate(businessId: string, userId: string, badgeLabel: string) {
    // Check count
    const { data: existing } = await this.supabaseService
      .from('affiliates')
      .select('id')
      .eq('business_id', businessId);

    if (existing && existing.length >= 10) {
      // Check if payment exists
      const { data: payment } = await this.supabaseService
        .from('transactions')
        .select('id')
        .eq('user_id', businessId)
        .eq('type', 'affiliate')
        .eq('status', 'completed')
        .gt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (!payment || payment.length < Math.floor((existing.length - 10) / 5) + 1) {
        throw new BadRequestException('Payment required for additional affiliates (₹75 each)');
      }
    }

    const { data, error } = await this.supabaseService
      .from('affiliates')
      .insert({
        business_id: businessId,
        user_id: userId,
        badge_label: badgeLabel,
        is_active: true,
      })
      .select(`
        *,
        profiles!user_id (username, avatar_url),
        business:profiles!business_id (username, avatar_url)
      `)
      .single();

    if (error) throw new Error('Failed to create affiliate');
    return data;
  }

  async getBusinessAffiliates(businessId: string) {
    const { data, error } = await this.supabaseService
      .from('affiliates')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to get affiliates:', error);
      return [];
    }
    return data || [];
  }

  async getUserAffiliates(userId: string) {
    const { data, error } = await this.supabaseService
      .from('affiliates')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('Failed to get user affiliates:', error);
      return [];
    }
    return data || [];
  }

  async removeAffiliate(businessId: string, affiliateId: string) {
    const { error } = await this.supabaseService
      .from('affiliates')
      .update({ is_active: false })
      .eq('id', affiliateId)
      .eq('business_id', businessId);

    if (error) throw new Error('Failed to remove affiliate');
    return { message: 'Affiliate removed' };
  }

  async updateBadgeLabel(businessId: string, affiliateId: string, label: string) {
    const { data, error } = await this.supabaseService
      .from('affiliates')
      .update({ badge_label: label })
      .eq('id', affiliateId)
      .eq('business_id', businessId)
      .select()
      .single();

    if (error) throw new Error('Failed to update badge label');
    return data;
  }

  async purchaseAffiliateSlots(businessId: string, slots: number, paymentId: string) {
    const amount = slots * 75; // ₹75 per slot

    const { data, error } = await this.supabaseService
      .from('transactions')
      .insert({
        user_id: businessId,
        amount,
        type: 'affiliate',
        status: 'completed',
        razorpay_payment_id: paymentId,
        metadata: { slots },
      })
      .select()
      .single();

    if (error) throw new Error('Failed to record purchase');
    return data;
  }
}

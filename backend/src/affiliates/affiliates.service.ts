import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';

@Injectable()
export class AffiliatesService {
  constructor(private supabaseService: SupabaseService) { }

  async createAffiliate(businessId: string, targetUsername: string) {
    // 1. Find the target user by username
    const { data: targetUser } = await this.supabaseService
      .from('profiles')
      .select('user_id')
      .ilike('username', targetUsername)
      .maybeSingle();

    if (!targetUser) {
      throw new NotFoundException(`User @${targetUsername} not found`);
    }

    const userId = targetUser.user_id;

    // 2. Fetch the Business's profile to get their name for the badge
    const { data: businessProfile } = await this.supabaseService
      .from('profiles')
      .select('username')
      .eq('user_id', businessId)
      .single();

    // 3. ENFORCE MASTER PLAN RULE: "Verified Agent - [Business Name]"
    const badgeLabel = `Verified Agent – ${businessProfile?.username || 'Business'}`;

    // 4. Check if already an affiliate
    const { data: alreadyAffiliate } = await this.supabaseService
      .from('affiliates')
      .select('id')
      .eq('business_id', businessId)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (alreadyAffiliate) {
      throw new BadRequestException('User is already an active affiliate');
    }

    // 5. Check the 10 Free Slots Limit Rule
    const { data: existing } = await this.supabaseService
      .from('affiliates')
      .select('id')
      .eq('business_id', businessId);

    if (existing && existing.length >= 10) {
      // Check if payment exists for the extra slots
      const { data: payment } = await this.supabaseService
        .from('transactions')
        .select('id')
        .eq('user_id', businessId)
        .eq('type', 'affiliate')
        .eq('status', 'completed');

      if (!payment || payment.length < Math.floor((existing.length - 10) / 1) + 1) {
        throw new BadRequestException('Payment required for additional affiliates (₹75 each)');
      }
    }

    // 6. Insert the new Affiliate
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
      .select('*, profiles!user_id(username, avatar_url, badge_type)')
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
      .select('*, business:profiles!business_id(username, avatar_url, badge_type)')
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

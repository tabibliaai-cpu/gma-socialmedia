import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';
import { CreateAdDto } from './dto/create-ad.dto';

@Injectable()
export class AdsService {
  constructor(private supabaseService: SupabaseService) {}

  async createAd(ownerId: string, dto: CreateAdDto) {
    const { data, error } = await this.supabaseService
      .from('ads')
      .insert({
        owner_id: ownerId,
        type: dto.type,
        title: dto.title,
        description: dto.description,
        media_url: dto.mediaUrl,
        target_url: dto.targetUrl,
        budget: dto.budget,
        targeting: dto.targeting || {},
        is_active: true,
      })
      .select()
      .single();

    if (error) throw new Error('Failed to create ad');
    return data;
  }

  async getAds(ownerId: string) {
    const { data, error } = await this.supabaseService
      .from('ads')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw new Error('Failed to get ads');
    return data;
  }

  async getAd(adId: string) {
    const { data, error } = await this.supabaseService
      .from('ads')
      .select('*')
      .eq('id', adId)
      .single();

    if (error) throw new Error('Ad not found');
    return data;
  }

  async updateAd(ownerId: string, adId: string, updates: Partial<CreateAdDto>) {
    const { data, error } = await this.supabaseService
      .from('ads')
      .update(updates)
      .eq('id', adId)
      .eq('owner_id', ownerId)
      .select()
      .single();

    if (error) throw new Error('Failed to update ad');
    return data;
  }

  async toggleAd(ownerId: string, adId: string, isActive: boolean) {
    const { data, error } = await this.supabaseService
      .from('ads')
      .update({ is_active: isActive })
      .eq('id', adId)
      .eq('owner_id', ownerId)
      .select()
      .single();

    if (error) throw new Error('Failed to toggle ad');
    return data;
  }

  async deleteAd(ownerId: string, adId: string) {
    const { error } = await this.supabaseService
      .from('ads')
      .delete()
      .eq('id', adId)
      .eq('owner_id', ownerId);

    if (error) throw new Error('Failed to delete ad');
    return { message: 'Ad deleted' };
  }

  async recordImpression(adId: string) {
    const { error } = await this.supabaseService.rpc('increment_impressions', { ad_id: adId });
    if (error) console.error('Failed to record impression:', error);
  }

  async recordClick(adId: string) {
    const { error } = await this.supabaseService.rpc('increment_clicks', { ad_id: adId });
    if (error) console.error('Failed to record click:', error);
  }

  async getAdStats(ownerId: string) {
    const { data: ads, error } = await this.supabaseService
      .from('ads')
      .select('id, type, budget, spent, impressions, clicks, is_active')
      .eq('owner_id', ownerId);

    if (error) throw new Error('Failed to get ad stats');

    const stats = {
      totalAds: ads?.length || 0,
      activeAds: ads?.filter(a => a.is_active).length || 0,
      totalBudget: ads?.reduce((sum, a) => sum + (a.budget || 0), 0) || 0,
      totalSpent: ads?.reduce((sum, a) => sum + (a.spent || 0), 0) || 0,
      totalImpressions: ads?.reduce((sum, a) => sum + (a.impressions || 0), 0) || 0,
      totalClicks: ads?.reduce((sum, a) => sum + (a.clicks || 0), 0) || 0,
      averageCTR: 0,
    };

    if (stats.totalImpressions > 0) {
      stats.averageCTR = (stats.totalClicks / stats.totalImpressions) * 100;
    }

    return stats;
  }

  async getAdsForPlacement(type: 'feed' | 'comment' | 'profile', limit: number = 3) {
    const { data, error } = await this.supabaseService
      .from('ads')
      .select('*')
      .eq('type', type)
      .eq('is_active', true)
      .gt('budget', this.supabaseService.rpc('get_spent', { ad_id: 'ads.id' }))
      .limit(limit);

    if (error) {
      console.error('Failed to get ads for placement:', error);
      return [];
    }

    return data || [];
  }
}

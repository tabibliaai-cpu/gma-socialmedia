import { Injectable, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { CreateDealDto } from './dto/create-deal.dto';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class CrmService {
  constructor(private supabaseService: SupabaseService) {}

  // ============ LEADS ============
  async createLead(businessId: string, dto: CreateLeadDto) {
    const insertData: any = {
      business_id: businessId,
      source: dto.source,
      status: 'new',
    };
    
    // Only add optional fields if they exist
    if (dto.userId) insertData.user_id = dto.userId;

    const { data, error } = await this.supabaseService
      .from('leads')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Create lead error:', error);
      throw new Error('Failed to create lead: ' + error.message);
    }
    return data;
  }

  async getLeads(businessId: string, status?: string) {
    let query = this.supabaseService
      .from('leads')
      .select(`
        *,
        profiles (username, avatar_url)
      `)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw new Error('Failed to get leads');
    return data;
  }

  async updateLeadStatus(businessId: string, leadId: string, status: string, notes?: string) {
    const updateData: any = { status };
    if (notes) updateData.notes = notes;

    const { data, error } = await this.supabaseService
      .from('leads')
      .update(updateData)
      .eq('id', leadId)
      .eq('business_id', businessId)
      .select()
      .single();

    if (error) throw new Error('Failed to update lead');
    return data;
  }

  async convertLeadToDeal(businessId: string, leadId: string, dealData: Partial<CreateDealDto>) {
    // Update lead status
    await this.updateLeadStatus(businessId, leadId, 'converted');

    // Create deal
    const { data: deal, error } = await this.supabaseService
      .from('deals')
      .insert({
        lead_id: leadId,
        business_id: businessId,
        title: dealData.title || 'Converted Deal',
        value: dealData.value || 0,
        status: 'open',
        expected_close_date: dealData.expectedCloseDate,
      })
      .select()
      .single();

    if (error) throw new Error('Failed to create deal');
    return deal;
  }

  // ============ DEALS ============
  async createDeal(businessId: string, dto: CreateDealDto) {
    const { data, error } = await this.supabaseService
      .from('deals')
      .insert({
        business_id: businessId,
        lead_id: dto.leadId,
        title: dto.title,
        value: dto.value,
        status: 'open',
        expected_close_date: dto.expectedCloseDate,
      })
      .select()
      .single();

    if (error) throw new Error('Failed to create deal');
    return data;
  }

  async getDeals(businessId: string, status?: string) {
    let query = this.supabaseService
      .from('deals')
      .select(`
        *,
        leads (id, profiles (username, avatar_url))
      `)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw new Error('Failed to get deals');
    return data;
  }

  async updateDealStatus(businessId: string, dealId: string, status: string) {
    const { data, error } = await this.supabaseService
      .from('deals')
      .update({ status })
      .eq('id', dealId)
      .eq('business_id', businessId)
      .select()
      .single();

    if (error) throw new Error('Failed to update deal');
    return data;
  }

  async getDealStats(businessId: string) {
    const { data: deals, error } = await this.supabaseService
      .from('deals')
      .select('status, value')
      .eq('business_id', businessId);

    if (error) throw new Error('Failed to get deal stats');

    const stats = {
      total: deals?.length || 0,
      open: 0,
      won: 0,
      lost: 0,
      totalValue: 0,
      wonValue: 0,
    };

    for (const deal of deals || []) {
      stats[deal.status as keyof typeof stats]++;
      stats.totalValue += deal.value || 0;
      if (deal.status === 'won') {
        stats.wonValue += deal.value || 0;
      }
    }

    return stats;
  }

  // ============ ORDERS ============
  async createOrder(businessId: string, dto: CreateOrderDto) {
    const { data, error } = await this.supabaseService
      .from('orders')
      .insert({
        customer_id: dto.customerId,
        business_id: businessId,
        deal_id: dto.dealId,
        total_amount: dto.totalAmount,
        status: 'pending',
        details: dto.details,
      })
      .select()
      .single();

    if (error) throw new Error('Failed to create order');
    return data;
  }

  async getOrders(businessId: string, status?: string) {
    let query = this.supabaseService
      .from('orders')
      .select(`
        *,
        profiles!customer_id (username, avatar_url),
        deals (title, value)
      `)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw new Error('Failed to get orders');
    return data;
  }

  async updateOrderStatus(businessId: string, orderId: string, status: string) {
    const { data, error } = await this.supabaseService
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .eq('business_id', businessId)
      .select()
      .single();

    if (error) throw new Error('Failed to update order');
    return data;
  }

  // ============ COMMISSIONS ============
  async createCommission(data: {
    userId: string;
    businessId: string;
    orderId: string;
    salesAmount: number;
    commissionRate: number;
  }) {
    const commissionAmount = data.salesAmount * (data.commissionRate / 100);

    const { data: commission, error } = await this.supabaseService
      .from('commissions')
      .insert({
        user_id: data.userId,
        business_id: data.businessId,
        order_id: data.orderId,
        sales_amount: data.salesAmount,
        commission_rate: data.commissionRate,
        commission_amount: commissionAmount,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw new Error('Failed to create commission');
    return commission;
  }

  async getCommissions(businessId: string) {
    const { data, error } = await this.supabaseService
      .from('commissions')
      .select(`
        *,
        profiles!user_id (username, avatar_url),
        orders (total_amount, status)
      `)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) throw new Error('Failed to get commissions');
    return data;
  }

  async getUserCommissions(userId: string) {
    const { data, error } = await this.supabaseService
      .from('commissions')
      .select(`
        *,
        profiles!commissions_business_id_fkey (username),
        orders (total_amount)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error('Failed to get user commissions');
    return data;
  }

  async updateCommissionStatus(commissionId: string, status: string) {
    const { data, error } = await this.supabaseService
      .from('commissions')
      .update({ status })
      .eq('id', commissionId)
      .select()
      .single();

    if (error) throw new Error('Failed to update commission');
    return data;
  }

  // ============ DASHBOARD ============
  async getCrmDashboard(businessId: string) {
    const [leads, deals, orders, commissions] = await Promise.all([
      this.supabaseService
        .from('leads')
        .select('status')
        .eq('business_id', businessId),
      this.supabaseService
        .from('deals')
        .select('status, value')
        .eq('business_id', businessId),
      this.supabaseService
        .from('orders')
        .select('status, total_amount')
        .eq('business_id', businessId),
      this.supabaseService
        .from('commissions')
        .select('status, commission_amount')
        .eq('business_id', businessId),
    ]);

    return {
      leads: {
        total: leads.data?.length || 0,
        new: leads.data?.filter(l => l.status === 'new').length || 0,
        hot: leads.data?.filter(l => l.status === 'hot').length || 0,
        warm: leads.data?.filter(l => l.status === 'warm').length || 0,
        cold: leads.data?.filter(l => l.status === 'cold').length || 0,
        converted: leads.data?.filter(l => l.status === 'converted').length || 0,
      },
      deals: {
        total: deals.data?.length || 0,
        open: deals.data?.filter(d => d.status === 'open').length || 0,
        won: deals.data?.filter(d => d.status === 'won').length || 0,
        lost: deals.data?.filter(d => d.status === 'lost').length || 0,
        totalValue: deals.data?.reduce((sum, d) => sum + (d.value || 0), 0) || 0,
        wonValue: deals.data?.filter(d => d.status === 'won').reduce((sum, d) => sum + (d.value || 0), 0) || 0,
      },
      orders: {
        total: orders.data?.length || 0,
        revenue: orders.data?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
      },
      commissions: {
        total: commissions.data?.reduce((sum, c) => sum + (c.commission_amount || 0), 0) || 0,
        pending: commissions.data?.filter(c => c.status === 'pending').reduce((sum, c) => sum + (c.commission_amount || 0), 0) || 0,
        paid: commissions.data?.filter(c => c.status === 'paid').reduce((sum, c) => sum + (c.commission_amount || 0), 0) || 0,
      },
    };
  }
}

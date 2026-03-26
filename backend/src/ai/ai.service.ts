import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { SupabaseService } from '../common/supabase/supabase.service';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY') || 'sk-dummykeyforlocaldevelopmentonlytoavoidcrashes123',
    });
  }

  async generateAutoReply(promptTemplate: string, context?: string) {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: promptTemplate,
          },
          {
            role: 'user',
            content: context || 'Generate a helpful response',
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || null;
    } catch (error) {
      console.error('AI auto-reply error:', error);
      return null;
    }
  }

  async generateLeadFollowUp(businessId: string, leadId: string) {
    // Get lead details
    const { data: lead } = await this.supabaseService
      .from('leads')
      .select(`
        *,
        profiles (username),
        businesses:profiles!leads_business_id_fkey (username)
      `)
      .eq('id', leadId)
      .single();

    if (!lead) return null;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a helpful business assistant. Generate a friendly follow-up message for a lead. Be professional but warm.`,
          },
          {
            role: 'user',
            content: `Generate a follow-up message for a lead named ${lead.profiles?.username || 'a potential customer'} who came from ${lead.source}. Their current status is ${lead.status}. Keep it brief and personalized.`,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || null;
    } catch (error) {
      console.error('AI follow-up error:', error);
      return null;
    }
  }

  async generateDealSuggestion(businessId: string, dealId: string) {
    const { data: deal } = await this.supabaseService
      .from('deals')
      .select(`
        *,
        leads (profiles (username))
      `)
      .eq('id', dealId)
      .single();

    if (!deal) return null;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a sales assistant. Analyze deals and provide actionable suggestions to close them.`,
          },
          {
            role: 'user',
            content: `Analyze this deal and provide 2-3 actionable suggestions to close it:
              Title: ${deal.title}
              Value: ${deal.value}
              Status: ${deal.status}
              Expected close date: ${deal.expected_close_date || 'Not set'}
              Customer: ${deal.leads?.profiles?.username || 'Unknown'}
            `,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || null;
    } catch (error) {
      console.error('AI deal suggestion error:', error);
      return null;
    }
  }

  async factCheckContent(content: string) {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a fact-checking assistant. Analyze the given content and determine if it appears factual, misleading, or requires verification. Respond with a JSON object containing: { "status": "verified" | "not_verified" | "misleading", "confidence": 0-100, "reason": "brief explanation", "suggestedSources": ["list of suggested sources to verify"] }`,
          },
          {
            role: 'user',
            content: content,
          },
        ],
        max_tokens: 300,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{}');
      return result;
    } catch (error) {
      console.error('Fact check error:', error);
      return { status: 'not_verified', confidence: 0, reason: 'Unable to verify' };
    }
  }

  async summarizeContent(content: string) {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Summarize the following content in 2-3 sentences.',
          },
          {
            role: 'user',
            content,
          },
        ],
        max_tokens: 100,
        temperature: 0.5,
      });

      return response.choices[0]?.message?.content || null;
    } catch (error) {
      console.error('Summarization error:', error);
      return null;
    }
  }

  async createAutomation(businessId: string, data: {
    type: 'auto_reply' | 'lead_followup' | 'deal_suggestion';
    triggerEvent: string;
    promptTemplate: string;
  }) {
    const { data: automation, error } = await this.supabaseService
      .from('ai_automations')
      .insert({
        business_id: businessId,
        type: data.type,
        trigger_event: data.triggerEvent,
        prompt_template: data.promptTemplate,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw new Error('Failed to create automation');
    return automation;
  }

  async getAutomations(businessId: string) {
    const { data, error } = await this.supabaseService
      .from('ai_automations')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) throw new Error('Failed to get automations');
    return data;
  }

  async toggleAutomation(businessId: string, automationId: string, isActive: boolean) {
    const { data, error } = await this.supabaseService
      .from('ai_automations')
      .update({ is_active: isActive })
      .eq('id', automationId)
      .eq('business_id', businessId)
      .select()
      .single();

    if (error) throw new Error('Failed to toggle automation');
    return data;
  }

  async deleteAutomation(businessId: string, automationId: string) {
    const { error } = await this.supabaseService
      .from('ai_automations')
      .delete()
      .eq('id', automationId)
      .eq('business_id', businessId);

    if (error) throw new Error('Failed to delete automation');
    return { message: 'Automation deleted' };
  }
}

import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @UseGuards(JwtAuthGuard)
  @Post('automations')
  async createAutomation(
    @Request() req,
    @Body('type') type: 'auto_reply' | 'lead_followup' | 'deal_suggestion',
    @Body('triggerEvent') triggerEvent: string,
    @Body('promptTemplate') promptTemplate: string,
  ) {
    return this.aiService.createAutomation(req.user.id, {
      type,
      triggerEvent,
      promptTemplate,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('automations')
  async getAutomations(@Request() req) {
    return this.aiService.getAutomations(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('automations/:id/toggle')
  async toggleAutomation(
    @Request() req,
    @Param('id') id: string,
    @Body('active') active: boolean,
  ) {
    return this.aiService.toggleAutomation(req.user.id, id, active);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('automations/:id')
  async deleteAutomation(@Request() req, @Param('id') id: string) {
    return this.aiService.deleteAutomation(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('followup/:leadId')
  async generateLeadFollowUp(@Request() req, @Param('leadId') leadId: string) {
    return this.aiService.generateLeadFollowUp(req.user.id, leadId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('deal-suggestion/:dealId')
  async generateDealSuggestion(@Request() req, @Param('dealId') dealId: string) {
    return this.aiService.generateDealSuggestion(req.user.id, dealId);
  }

  @Post('fact-check')
  async factCheck(@Body('content') content: string) {
    return this.aiService.factCheckContent(content);
  }

  @Post('summarize')
  async summarize(@Body('content') content: string) {
    return this.aiService.summarizeContent(content);
  }

  @Post('reply')
  async generateReply(
    @Body('promptTemplate') promptTemplate: string,
    @Body('context') context?: string,
  ) {
    return this.aiService.generateAutoReply(promptTemplate, context);
  }
}

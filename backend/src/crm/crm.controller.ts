import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CrmService } from './crm.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { CreateDealDto } from './dto/create-deal.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('crm')
@UseGuards(JwtAuthGuard)
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  // ============ LEADS ============
  @Post('leads')
  async createLead(@Request() req, @Body() dto: CreateLeadDto) {
    return this.crmService.createLead(req.user.id, dto);
  }

  @Get('leads')
  async getLeads(@Request() req, @Query('status') status?: string) {
    return this.crmService.getLeads(req.user.id, status);
  }

  @Put('leads/:id/status')
  async updateLeadStatus(
    @Request() req,
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('notes') notes?: string,
  ) {
    return this.crmService.updateLeadStatus(req.user.id, id, status, notes);
  }

  @Post('leads/:id/convert')
  async convertLeadToDeal(
    @Request() req,
    @Param('id') id: string,
    @Body() dealData: Partial<CreateDealDto>,
  ) {
    return this.crmService.convertLeadToDeal(req.user.id, id, dealData);
  }

  // ============ DEALS ============
  @Post('deals')
  async createDeal(@Request() req, @Body() dto: CreateDealDto) {
    return this.crmService.createDeal(req.user.id, dto);
  }

  @Get('deals')
  async getDeals(@Request() req, @Query('status') status?: string) {
    return this.crmService.getDeals(req.user.id, status);
  }

  @Put('deals/:id/status')
  async updateDealStatus(
    @Request() req,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.crmService.updateDealStatus(req.user.id, id, status);
  }

  @Get('deals/stats')
  async getDealStats(@Request() req) {
    return this.crmService.getDealStats(req.user.id);
  }

  // ============ ORDERS ============
  @Post('orders')
  async createOrder(@Request() req, @Body() dto: CreateOrderDto) {
    return this.crmService.createOrder(req.user.id, dto);
  }

  @Get('orders')
  async getOrders(@Request() req, @Query('status') status?: string) {
    return this.crmService.getOrders(req.user.id, status);
  }

  @Put('orders/:id/status')
  async updateOrderStatus(
    @Request() req,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.crmService.updateOrderStatus(req.user.id, id, status);
  }

  // ============ COMMISSIONS ============
  @Get('commissions')
  async getCommissions(@Request() req) {
    return this.crmService.getCommissions(req.user.id);
  }

  @Get('commissions/mine')
  async getUserCommissions(@Request() req) {
    return this.crmService.getUserCommissions(req.user.id);
  }

  @Put('commissions/:id/status')
  async updateCommissionStatus(
    @Request() req,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.crmService.updateCommissionStatus(id, status);
  }

  // ============ DASHBOARD ============
  @Get('dashboard')
  async getDashboard(@Request() req) {
    return this.crmService.getCrmDashboard(req.user.id);
  }
}

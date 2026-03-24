import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AffiliatesService } from './affiliates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('affiliates')
@UseGuards(JwtAuthGuard)
export class AffiliatesController {
  constructor(private readonly affiliatesService: AffiliatesService) {}

  @Post()
  async create(
    @Request() req,
    @Body('userId') userId: string,
    @Body('badgeLabel') badgeLabel: string,
  ) {
    return this.affiliatesService.createAffiliate(req.user.id, userId, badgeLabel);
  }

  @Get()
  async getBusinessAffiliates(@Request() req) {
    return this.affiliatesService.getBusinessAffiliates(req.user.id);
  }

  @Get('mine')
  async getUserAffiliates(@Request() req) {
    return this.affiliatesService.getUserAffiliates(req.user.id);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    return this.affiliatesService.removeAffiliate(req.user.id, id);
  }

  @Put(':id/label')
  async updateLabel(
    @Request() req,
    @Param('id') id: string,
    @Body('label') label: string,
  ) {
    return this.affiliatesService.updateBadgeLabel(req.user.id, id, label);
  }

  @Post('purchase-slots')
  async purchaseSlots(
    @Request() req,
    @Body('slots') slots: number,
    @Body('paymentId') paymentId: string,
  ) {
    return this.affiliatesService.purchaseAffiliateSlots(req.user.id, slots, paymentId);
  }
}

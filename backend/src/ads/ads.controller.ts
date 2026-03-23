import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AdsService } from './ads.service';
import { CreateAdDto } from './dto/create-ad.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createAd(@Request() req, @Body() dto: CreateAdDto) {
    return this.adsService.createAd(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMyAds(@Request() req) {
    return this.adsService.getAds(req.user.id);
  }

  @Get('placement')
  async getAdsForPlacement(
    @Query('type') type: 'feed' | 'comment' | 'profile',
    @Query('limit') limit = 3,
  ) {
    return this.adsService.getAdsForPlacement(type, +limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getAdStats(@Request() req) {
    return this.adsService.getAdStats(req.user.id);
  }

  @Get(':id')
  async getAd(@Param('id') id: string) {
    return this.adsService.getAd(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateAd(@Request() req, @Param('id') id: string, @Body() dto: Partial<CreateAdDto>) {
    return this.adsService.updateAd(req.user.id, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/toggle')
  async toggleAd(@Request() req, @Param('id') id: string, @Body('active') active: boolean) {
    return this.adsService.toggleAd(req.user.id, id, active);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteAd(@Request() req, @Param('id') id: string) {
    return this.adsService.deleteAd(req.user.id, id);
  }

  @Post(':id/impression')
  async recordImpression(@Param('id') id: string) {
    await this.adsService.recordImpression(id);
    return { success: true };
  }

  @Post(':id/click')
  async recordClick(@Param('id') id: string) {
    await this.adsService.recordClick(id);
    return { success: true };
  }
}

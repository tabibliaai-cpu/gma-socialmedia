import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePrivacyDto } from './dto/update-privacy.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getMyProfile(@Request() req) {
    return this.usersService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('privacy')
  async updatePrivacy(@Request() req, @Body() updatePrivacyDto: UpdatePrivacyDto) {
    return this.usersService.updatePrivacy(req.user.id, updatePrivacyDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('business-settings')
  async updateBusinessSettings(@Request() req, @Body() body: { auto_reply_enabled: boolean; auto_reply_message: string }) {
    if (req.user.role !== 'business') {
      throw new BadRequestException('Only business accounts can configure this');
    }
    return this.usersService.updateBusinessSettings(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('follow/:userId')
  async followUser(@Request() req, @Param('userId') userId: string) {
    return this.usersService.followUser(req.user.id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('unfollow/:userId')
  async unfollowUser(@Request() req, @Param('userId') userId: string) {
    return this.usersService.unfollowUser(req.user.id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('check-follow/:userId')
  async checkFollowStatus(@Request() req, @Param('userId') userId: string) {
    return this.usersService.checkFollowStatus(req.user.id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('share-link')
  async createShareLink(@Request() req) {
    return this.usersService.createShareLink(req.user.id);
  }

  @Get('shared/:token')
  async getSharedProfile(@Param('token') token: string) {
    return this.usersService.getSharedProfile(token);
  }

  // Parameterized routes must come LAST to avoid intercepting specific routes
  @Get(':username/followers')
  async getFollowers(@Param('username') username: string) {
    return this.usersService.getFollowers(username);
  }

  @Get(':username/following')
  async getFollowing(@Param('username') username: string) {
    return this.usersService.getFollowing(username);
  }

  @Get(':username')
  async getUserProfile(@Param('username') username: string) {
    return this.usersService.getPublicProfile(username);
  }
}

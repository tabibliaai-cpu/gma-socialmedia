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
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPost(@Request() req, @Body() createPostDto: CreatePostDto) {
    console.log('createPost - req.user:', JSON.stringify(req.user));
    console.log('createPost - req.user.id:', req.user?.id);
    return this.postsService.createPost(req.user.id, createPostDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('feed')
  async getFeed(@Request() req, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.postsService.getFeed(req.user.id, +page, +limit);
  }

  @Get('explore')
  async getExplore(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.postsService.getExploreFeed(+page, +limit);
  }

  @Get('user/:userId')
  async getUserPosts(
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.postsService.getUserPosts(userId, +page, +limit);
  }

  @Get(':id')
  async getPost(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id;
    return this.postsService.getPostById(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updatePost(
    @Request() req,
    @Param('id') id: string,
    @Body() updateData: CreatePostDto,
  ) {
    return this.postsService.updatePost(req.user.id, id, updateData);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePost(@Request() req, @Param('id') id: string) {
    return this.postsService.deletePost(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async likePost(@Request() req, @Param('id') id: string) {
    return this.postsService.likePost(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/like')
  async unlikePost(@Request() req, @Param('id') id: string) {
    return this.postsService.unlikePost(req.user.id, id);
  }

  @Get(':id/comments')
  async getComments(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.postsService.getComments(id, +page, +limit);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async addComment(@Request() req, @Param('id') id: string, @Body('content') content: string) {
    return this.postsService.addComment(req.user.id, id, content);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('comments/:commentId')
  async deleteComment(@Request() req, @Param('commentId') commentId: string) {
    return this.postsService.deleteComment(req.user.id, commentId);
  }
}

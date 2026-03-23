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
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() dto: CreateArticleDto) {
    return this.articlesService.create(req.user.id, dto);
  }

  @Get()
  async getAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.articlesService.getAll(+page, +limit);
  }

  @Get('author/:authorId')
  async getByAuthor(
    @Param('authorId') authorId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.articlesService.getByAuthor(authorId, +page, +limit);
  }

  @Get('purchased')
  @UseGuards(JwtAuthGuard)
  async getPurchased(@Request() req) {
    return this.articlesService.getPurchasedArticles(req.user.id);
  }

  @Get('earnings')
  @UseGuards(JwtAuthGuard)
  async getEarnings(@Request() req) {
    return this.articlesService.getAuthorEarnings(req.user.id);
  }

  @Get(':id')
  async getById(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id;
    return this.articlesService.getById(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Request() req, @Param('id') id: string, @Body() dto: Partial<CreateArticleDto>) {
    return this.articlesService.update(req.user.id, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    return this.articlesService.delete(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/purchase')
  async purchase(@Request() req, @Param('id') id: string, @Body('paymentId') paymentId: string) {
    return this.articlesService.purchase(req.user.id, id, paymentId);
  }
}

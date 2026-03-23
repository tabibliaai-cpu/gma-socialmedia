import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(
    @Query('q') query: string,
    @Query('type') type: 'all' | 'users' | 'posts' | 'articles' = 'all',
  ) {
    return this.searchService.search(query, type);
  }

  @Get('fact-check')
  async searchWithFactCheck(@Query('q') query: string) {
    return this.searchService.searchWithFactCheck(query);
  }

  @Get('trending')
  async getTrending() {
    return this.searchService.getTrendingTopics();
  }

  @Get('suggestions')
  async getSuggestions(@Query('q') query: string) {
    return this.searchService.getSuggestions(query);
  }
}

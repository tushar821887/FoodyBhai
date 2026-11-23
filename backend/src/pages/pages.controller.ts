import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  NotFoundException 
} from '@nestjs/common';
import { PagesService } from './pages.service';

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  async findAll() {
    return this.pagesService.findAll();
  }

  @Get('by-slug')
  async findBySlugQuery(@Query('slug') slug: string) {
    const page = await this.pagesService.findBySlug(slug || '');
    if (!page) {
      throw new NotFoundException(`Page with slug "${slug}" not found`);
    }
    return page;
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const page = await this.pagesService.findBySlug(slug);
    if (!page) {
      throw new NotFoundException(`Page with slug "${slug}" not found`);
    }
    return page;
  }

  @Post()
  async create(@Body() pageData: any) {
    return this.pagesService.create(pageData);
  }

  @Put('bulk')
  async bulkSave(@Body() pages: any[]) {
    // Also handle when body is { pages: [...] }
    const list = Array.isArray(pages) ? pages : (pages as any)?.pages || (pages as any)?.value || [];
    return this.pagesService.bulkSave(list);
  }

  @Put('slug/:slug')
  async updateBySlug(@Param('slug') slug: string, @Body() pageData: any) {
    return this.pagesService.update(slug, pageData);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() pageData: any) {
    // If id matches a slug, update by slug
    return this.pagesService.update(id, pageData);
  }

  @Delete('slug/:slug')
  async deleteBySlug(@Param('slug') slug: string) {
    return this.pagesService.remove(slug);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.pagesService.remove(id);
  }
}

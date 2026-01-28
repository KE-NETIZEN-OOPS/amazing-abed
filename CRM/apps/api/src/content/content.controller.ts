import { Controller, Get, Query } from '@nestjs/common';
import { ContentService } from './content.service';

@Controller('content')
export class ContentController {
  constructor(private contentService: ContentService) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.contentService.findAll(query);
  }
}

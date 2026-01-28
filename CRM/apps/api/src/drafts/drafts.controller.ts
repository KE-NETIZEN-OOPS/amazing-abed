import { Controller, Get } from '@nestjs/common';
import { DraftsService } from './drafts.service';

@Controller('drafts')
export class DraftsController {
  constructor(private draftsService: DraftsService) {}

  @Get()
  async findAll() {
    return this.draftsService.findAll();
  }
}

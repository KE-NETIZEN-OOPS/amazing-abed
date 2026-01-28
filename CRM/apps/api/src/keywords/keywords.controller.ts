import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { KeywordsService } from './keywords.service';

@Controller('keywords')
export class KeywordsController {
  constructor(private keywordsService: KeywordsService) {}

  @Get('account/:accountId')
  async findByAccount(@Param('accountId') accountId: string) {
    return this.keywordsService.findByAccount(accountId);
  }

  @Post()
  async create(@Body() data: { accountId: string; baseTerm: string; variants?: string[] }) {
    return this.keywordsService.create(data.accountId, data.baseTerm, data.variants || []);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: { baseTerm: string; variants: string[] }) {
    return this.keywordsService.update(id, data.baseTerm, data.variants);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.keywordsService.delete(id);
  }
}

import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { AccountsService } from './accounts.service';

@Controller('accounts')
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Get()
  async findAll() {
    return this.accountsService.findAll();
  }

  @Post()
  async create(@Body() data: any) {
    try {
      const account = await this.accountsService.create(data);
      return { success: true, account };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.accountsService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.accountsService.delete(id);
  }
}

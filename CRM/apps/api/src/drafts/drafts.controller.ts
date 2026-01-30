import { Controller, Get, Post, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { DraftsService } from './drafts.service';

@Controller('drafts')
export class DraftsController {
  constructor(private draftsService: DraftsService) {}

  @Get()
  async findAll() {
    try {
      return await this.draftsService.findAll();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch drafts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/approve')
  async approveAndPost(@Param('id') id: string, @Body() body: { postToReddit?: boolean }) {
    try {
      return await this.draftsService.approveAndPost(id, body.postToReddit !== false);
    } catch (error) {
      console.error('Error in approveAndPost controller:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to approve and post draft',
          error: error.stack,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/reject')
  async reject(@Param('id') id: string) {
    try {
      return await this.draftsService.reject(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to reject draft',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

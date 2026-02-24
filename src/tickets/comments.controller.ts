import {
  Controller,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request as NestRequest,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { UpdateCommentDto } from '../common/ticket.dtos';
import { JwtGuard } from '../common/jwt.guard';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private ticketsService: TicketsService) {}

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT')
  @ApiResponse({ status: 200, description: 'Comment updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async updateComment(
    @Param('id') commentId: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @NestRequest() req,
  ) {
    return this.ticketsService.updateComment(
      commentId,
      updateCommentDto.comment,
      req.user.sub,
      req.user.role_name,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT')
  @ApiResponse({ status: 204, description: 'Comment deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async deleteComment(
    @Param('id') commentId: number,
    @NestRequest() req,
  ) {
    await this.ticketsService.deleteComment(
      commentId,
      req.user.sub,
      req.user.role_name,
    );
  }
}

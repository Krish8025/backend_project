import {
  Controller,
  Post,
  Get,
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
import { CreateTicketDto, UpdateTicketStatusDto, AssignTicketDto, CreateCommentDto } from '../common/ticket.dtos';
import { JwtGuard } from '../common/jwt.guard';
import { Roles, RolesGuard } from '../common/roles.guard';
import { RoleName } from '@prisma/client';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles([RoleName.USER, RoleName.MANAGER])
  @ApiBearerAuth('JWT')
  @ApiResponse({ status: 201, description: 'Ticket created' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createTicketDto: CreateTicketDto,
    @NestRequest() req,
  ) {
    return this.ticketsService.create(createTicketDto, req.user.sub);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT')
  @ApiResponse({ status: 200, description: 'Tickets retrieved' })
  async findAll(@NestRequest() req) {
    return this.ticketsService.findAll(req.user.sub, req.user.role_name);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT')
  @ApiResponse({ status: 200, description: 'Ticket retrieved' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async findById(@Param('id') id: number) {
    return this.ticketsService.findById(id);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles([RoleName.MANAGER, RoleName.SUPPORT])
  @ApiBearerAuth('JWT')
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async updateStatus(
    @Param('id') id: number,
    @Body() updateStatusDto: UpdateTicketStatusDto,
    @NestRequest() req,
  ) {
    return this.ticketsService.updateStatus(
      id,
      updateStatusDto,
      req.user.sub,
      req.user.role_name,
    );
  }

  @Patch(':id/assign')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles([RoleName.MANAGER, RoleName.SUPPORT])
  @ApiBearerAuth('JWT')
  @ApiResponse({ status: 200, description: 'Ticket assigned' })
  @ApiResponse({ status: 400, description: 'Invalid assignment' })
  async assign(
    @Param('id') id: number,
    @Body() assignDto: AssignTicketDto,
    @NestRequest() req,
  ) {
    return this.ticketsService.assign(id, assignDto, req.user.role_name);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles([RoleName.MANAGER])
  @ApiBearerAuth('JWT')
  @ApiResponse({ status: 204, description: 'Ticket deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async delete(@Param('id') id: number, @NestRequest() req) {
    await this.ticketsService.delete(id, req.user.role_name);
  }

  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT')
  @ApiResponse({ status: 201, description: 'Comment added' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async addComment(
    @Param('id') ticketId: number,
    @Body() createCommentDto: CreateCommentDto,
    @NestRequest() req,
  ) {
    return this.ticketsService.addComment(
      ticketId,
      req.user.sub,
      createCommentDto.comment,
      req.user.role_name,
    );
  }

  @Get(':id/comments')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT')
  @ApiResponse({ status: 200, description: 'Comments retrieved' })
  async getComments(@Param('id') ticketId: number) {
    return this.ticketsService.getComments(ticketId);
  }
}

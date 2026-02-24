import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto, UpdateTicketStatusDto, AssignTicketDto } from '../common/ticket.dtos';
import { RoleName, TicketStatus } from '@prisma/client';

const VALID_STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS],
  [TicketStatus.IN_PROGRESS]: [TicketStatus.RESOLVED],
  [TicketStatus.RESOLVED]: [TicketStatus.CLOSED],
  [TicketStatus.CLOSED]: [],
};

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) { }

  async create(createTicketDto: CreateTicketDto, userId: number) {
    if (createTicketDto.title.length < 5) {
      throw new BadRequestException('Title must be at least 5 characters');
    }
    if (createTicketDto.description.length < 10) {
      throw new BadRequestException('Description must be at least 10 characters');
    }

    return this.prisma.ticket.create({
      data: {
        title: createTicketDto.title,
        description: createTicketDto.description,
        priority: createTicketDto.priority ?? 'MEDIUM',
        status: 'OPEN',
        created_by: userId,
      },
      include: { creator: true, assignee: true },
    });
  }

  async findAll(userId: number, userRole: RoleName) {
    const include = { creator: true, assignee: true, comments: true };

    if (userRole === RoleName.MANAGER) {
      return this.prisma.ticket.findMany({ include });
    }
    if (userRole === RoleName.SUPPORT) {
      return this.prisma.ticket.findMany({ where: { assigned_to: userId }, include });
    }
    return this.prisma.ticket.findMany({ where: { created_by: userId }, include });
  }

  async findById(id: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: { creator: true, assignee: true, comments: true, status_logs: true },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async updateStatus(
    id: number,
    updateStatusDto: UpdateTicketStatusDto,
    userId: number,
    userRole: RoleName,
  ) {
    const ticket = await this.findById(id);
    const newStatus = updateStatusDto.status as TicketStatus;

    const validTransitions = VALID_STATUS_TRANSITIONS[ticket.status];
    if (!validTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${ticket.status} to ${newStatus}`,
      );
    }

    await this.prisma.ticketStatusLog.create({
      data: {
        ticket_id: id,
        old_status: ticket.status,
        new_status: newStatus,
        changed_by: userId,
      },
    });

    return this.prisma.ticket.update({
      where: { id },
      data: { status: newStatus },
      include: { creator: true, assignee: true },
    });
  }

  async assign(id: number, assignDto: AssignTicketDto, userRole: RoleName) {
    await this.findById(id);

    const assignedToUser = await this.prisma.user.findUnique({
      where: { id: assignDto.assigned_to_id },
      include: { role: true },
    });

    if (!assignedToUser) {
      throw new BadRequestException('User not found');
    }
    if (assignedToUser.role.name === RoleName.USER) {
      throw new BadRequestException('Cannot assign tickets to USER role');
    }

    return this.prisma.ticket.update({
      where: { id },
      data: { assigned_to: assignDto.assigned_to_id },
      include: { creator: true, assignee: true },
    });
  }

  async delete(id: number, userRole: RoleName): Promise<void> {
    if (userRole !== RoleName.MANAGER) {
      throw new ForbiddenException('Only managers can delete tickets');
    }
    await this.findById(id);
    await this.prisma.ticket.delete({ where: { id } });
  }

  async addComment(
    ticketId: number,
    userId: number,
    commentText: string,
    userRole: RoleName,
  ) {
    const ticket = await this.findById(ticketId);

    if (userRole === RoleName.SUPPORT && ticket.assigned_to !== userId) {
      throw new ForbiddenException('Support staff can only comment on assigned tickets');
    }
    if (userRole === RoleName.USER && ticket.created_by !== userId) {
      throw new ForbiddenException('Users can only comment on their own tickets');
    }

    return this.prisma.ticketComment.create({
      data: { ticket_id: ticketId, user_id: userId, comment: commentText },
      include: { user: true },
    });
  }

  async getComments(ticketId: number) {
    return this.prisma.ticketComment.findMany({
      where: { ticket_id: ticketId },
      include: { user: true },
      orderBy: { created_at: 'asc' },
    });
  }

  async updateComment(
    commentId: number,
    commentText: string,
    userId: number,
    userRole: RoleName,
  ) {
    const comment = await this.prisma.ticketComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) throw new NotFoundException('Comment not found');
    if (userRole !== RoleName.MANAGER && comment.user_id !== userId) {
      throw new ForbiddenException('Cannot update this comment');
    }

    return this.prisma.ticketComment.update({
      where: { id: commentId },
      data: { comment: commentText },
      include: { user: true },
    });
  }

  async deleteComment(commentId: number, userId: number, userRole: RoleName): Promise<void> {
    const comment = await this.prisma.ticketComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) throw new NotFoundException('Comment not found');
    if (userRole !== RoleName.MANAGER && comment.user_id !== userId) {
      throw new ForbiddenException('Cannot delete this comment');
    }

    await this.prisma.ticketComment.delete({ where: { id: commentId } });
  }
}

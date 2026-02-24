import { IsEmail, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateTicketDto {
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  title: string;

  @IsNotEmpty()
  @MinLength(10)
  description: string;

  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export class UpdateTicketStatusDto {
  @IsNotEmpty()
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
}

export class AssignTicketDto {
  @IsNotEmpty()
  assigned_to_id: number;
}

export class CreateCommentDto {
  @IsNotEmpty()
  @MinLength(1)
  comment: string;
}

export class UpdateCommentDto {
  @IsNotEmpty()
  @MinLength(1)
  comment: string;
}

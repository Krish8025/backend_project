import { Injectable } from '@nestjs/common';
import { promises } from 'dns';

export type MANAGER =any
@Injectable()
export class ManagerService {
    private readonly MANAGER = [
    {
      userId: 1,
      username: 'manager1',
    },
  ];

     async findOne(username: string): Promise<MANAGER | undefined> {
    return this.MANAGER.find(MANAGER => MANAGER.username === username);
  }
}


import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoleName } from '@prisma/client';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) { }

  async findOne(name: RoleName) {
    return this.prisma.role.findUnique({ where: { name } });
  }

  async findById(id: number) {
    return this.prisma.role.findUnique({ where: { id } });
  }

  async findAll() {
    return this.prisma.role.findMany();
  }

  async seed(): Promise<void> {
    const count = await this.prisma.role.count();
    if (count > 0) return;

    await this.prisma.role.createMany({
      data: [
        { name: RoleName.MANAGER },
        { name: RoleName.SUPPORT },
        { name: RoleName.USER },
      ],
      skipDuplicates: true,
    });
  }
}

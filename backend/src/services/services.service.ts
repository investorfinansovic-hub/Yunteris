import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.service.findMany({ include: { options: true } });
  }

  findOne(id: string) {
    return this.prisma.service.findUnique({ where: { id }, include: { options: true } });
  }
}

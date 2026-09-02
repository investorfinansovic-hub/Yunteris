import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('subscription-plans')
export class SubscriptionPlansController {
  constructor(private prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.subscriptionPlan.findMany({ orderBy: { price: 'asc' } });
  }
}

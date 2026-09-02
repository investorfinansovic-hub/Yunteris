import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(orderId: string, clientId: string, dto: CreateReviewDto) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Заказ не найден');
    if (order.clientId !== clientId) throw new ForbiddenException('Это не ваш заказ');
    if (order.status !== OrderStatus.COMPLETED) {
      throw new BadRequestException('Отзыв можно оставить только по завершённому заказу');
    }
    if (!order.cleanerId) throw new BadRequestException('У заказа нет исполнителя');

    const review = await this.prisma.review.create({
      data: {
        orderId,
        fromUserId: clientId,
        toUserId: order.cleanerId,
        rating: dto.rating,
        comment: dto.comment,
      },
    });

    await this.recalculateRating(order.cleanerId);
    return review;
  }

  private async recalculateRating(cleanerId: string) {
    const agg = await this.prisma.review.aggregate({
      where: { toUserId: cleanerId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await this.prisma.cleanerProfile.update({
      where: { userId: cleanerId },
      data: {
        ratingAvg: agg._avg.rating ?? 0,
        ratingCount: agg._count.rating,
      },
    });
  }
}

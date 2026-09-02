import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthUser } from '../common/current-user.decorator';

const NEXT_STATUS: Record<string, OrderStatus> = {
  EN_ROUTE: OrderStatus.EN_ROUTE,
  IN_PROGRESS: OrderStatus.IN_PROGRESS,
  COMPLETED: OrderStatus.COMPLETED,
};

// A cleaner-driven status can only be set from a specific previous status,
// so a stale client can't skip steps or replay an old transition.
const ALLOWED_FROM: Record<string, OrderStatus> = {
  EN_ROUTE: OrderStatus.ASSIGNED,
  IN_PROGRESS: OrderStatus.EN_ROUTE,
  COMPLETED: OrderStatus.IN_PROGRESS,
};

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private subscriptions: SubscriptionsService,
  ) {}

  /** Client submits a free request — it's immediately visible to subscribed cleaners in the district. */
  async create(clientId: string, dto: CreateOrderDto) {
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
      include: { options: true },
    });
    if (!service) throw new NotFoundException('Услуга не найдена');

    const optionIds = dto.optionIds ?? [];
    const chosenOptions = await this.prisma.serviceOption.findMany({
      where: { id: { in: optionIds } },
    });
    if (chosenOptions.length !== optionIds.length) {
      throw new BadRequestException('Одна или несколько допуслуг не найдены');
    }

    const price = service.basePrice + chosenOptions.reduce((sum, o) => sum + o.price, 0);

    return this.prisma.order.create({
      data: {
        clientId,
        serviceId: dto.serviceId,
        address: dto.address,
        district: dto.district,
        scheduledAt: new Date(dto.scheduledAt),
        price,
        status: OrderStatus.SEARCHING,
        options: { create: optionIds.map((optionId) => ({ optionId })) },
      },
      include: { options: { include: { option: true } }, service: true },
    });
  }

  /** Open leads for a cleaner to accept — requires an active subscription and a matching district. */
  async feed(cleanerId: string) {
    await this.subscriptions.assertActive(cleanerId);

    const profile = await this.prisma.cleanerProfile.findUnique({ where: { userId: cleanerId } });
    const districtFilter = profile?.serviceAreas?.length ? { district: { in: profile.serviceAreas } } : {};

    return this.prisma.order.findMany({
      where: { status: OrderStatus.SEARCHING, cleanerId: null, ...districtFilter },
      include: { service: true, options: { include: { option: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  /** Atomic accept: the WHERE clause guards against two cleaners racing the same lead. */
  async accept(orderId: string, cleanerId: string) {
    await this.subscriptions.assertActive(cleanerId);

    const result = await this.prisma.order.updateMany({
      where: { id: orderId, status: OrderStatus.SEARCHING, cleanerId: null },
      data: { status: OrderStatus.ASSIGNED, cleanerId },
    });
    if (result.count === 0) {
      throw new ConflictException('Заявку уже принял другой исполнитель или она недоступна');
    }
    return this.prisma.order.findUnique({ where: { id: orderId }, include: { service: true, client: true } });
  }

  async updateStatus(orderId: string, cleanerId: string, nextStatus: keyof typeof NEXT_STATUS) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Заказ не найден');
    if (order.cleanerId !== cleanerId) throw new ForbiddenException('Это не ваш заказ');

    const requiredFrom = ALLOWED_FROM[nextStatus];
    if (order.status !== requiredFrom) {
      throw new BadRequestException(`Нельзя перейти в статус ${nextStatus} из ${order.status}`);
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: NEXT_STATUS[nextStatus] },
    });
  }

  async listMine(user: AuthUser) {
    if (user.role === 'CLIENT') {
      return this.prisma.order.findMany({
        where: { clientId: user.userId },
        include: { service: true, options: { include: { option: true } }, cleaner: true },
        orderBy: { createdAt: 'desc' },
      });
    }
    return this.prisma.order.findMany({
      where: { cleanerId: user.userId },
      include: { service: true, options: { include: { option: true } }, client: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { service: true, options: { include: { option: true } }, client: true, cleaner: true },
    });
    if (!order) throw new NotFoundException('Заказ не найден');
    return order;
  }
}

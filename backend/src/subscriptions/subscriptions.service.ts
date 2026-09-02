import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionPaymentStatus, SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProviderChargeService } from '../billing/provider-charge.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    private prisma: PrismaService,
    private billing: ProviderChargeService,
  ) {}

  private async getCleanerProfile(userId: string) {
    const profile = await this.prisma.cleanerProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Профиль исполнителя не найден');
    return profile;
  }

  private async getDefaultPlan() {
    const plan = await this.prisma.subscriptionPlan.findFirst({ orderBy: { price: 'asc' } });
    if (!plan) throw new NotFoundException('Тарифные планы ещё не настроены — выполните сид базы данных');
    return plan;
  }

  async assertActive(userId: string) {
    const profile = await this.getCleanerProfile(userId);
    const sub = await this.prisma.subscription.findUnique({ where: { cleanerProfileId: profile.id } });
    const isActive = sub && sub.status === SubscriptionStatus.ACTIVE && sub.currentPeriodEnd > new Date();
    if (!isActive) {
      throw new ForbiddenException(
        'Нужна активная подписка, чтобы видеть и принимать заявки. Оформите подписку в личном кабинете.',
      );
    }
  }

  async getMine(userId: string) {
    const profile = await this.getCleanerProfile(userId);
    return this.prisma.subscription.findUnique({
      where: { cleanerProfileId: profile.id },
      include: { plan: true },
    });
  }

  async subscribe(userId: string) {
    const profile = await this.getCleanerProfile(userId);
    const plan = await this.getDefaultPlan();

    const existing = await this.prisma.subscription.findUnique({ where: { cleanerProfileId: profile.id } });
    if (existing && existing.status === SubscriptionStatus.ACTIVE && existing.currentPeriodEnd > new Date()) {
      return existing;
    }

    const charge = await this.billing.chargeFirst(userId, plan.price);
    if (!charge.success) throw new BadRequestException('Оплата подписки не прошла, попробуйте другую карту');

    const currentPeriodEnd = addDays(new Date(), plan.periodDays);

    const subscription = existing
      ? await this.prisma.subscription.update({
          where: { id: existing.id },
          data: { planId: plan.id, status: SubscriptionStatus.ACTIVE, currentPeriodEnd },
        })
      : await this.prisma.subscription.create({
          data: {
            cleanerProfileId: profile.id,
            planId: plan.id,
            status: SubscriptionStatus.ACTIVE,
            currentPeriodEnd,
          },
        });

    await this.prisma.subscriptionPayment.create({
      data: {
        subscriptionId: subscription.id,
        amount: plan.price,
        status: SubscriptionPaymentStatus.SUCCEEDED,
        providerPaymentId: charge.providerPaymentId,
      },
    });

    return subscription;
  }

  async cancel(userId: string) {
    const profile = await this.getCleanerProfile(userId);
    const sub = await this.prisma.subscription.findUnique({ where: { cleanerProfileId: profile.id } });
    if (!sub) throw new NotFoundException('Подписка не найдена');
    return this.prisma.subscription.update({ where: { id: sub.id }, data: { status: SubscriptionStatus.CANCELED } });
  }

  /**
   * Daily autopayment run: charges every subscription whose period has ended.
   * TODO(real billing): swap ProviderChargeService's stub for a real ЮKassa
   * rebilling call keyed on providerPaymentMethodId before relying on this in production.
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async runDailyBilling() {
    const dueSubscriptions = await this.prisma.subscription.findMany({
      where: { status: SubscriptionStatus.ACTIVE, currentPeriodEnd: { lte: new Date() } },
      include: { plan: true },
    });

    for (const sub of dueSubscriptions) {
      const charge = await this.billing.chargeRecurring(sub.id, sub.plan.price);
      if (charge.success) {
        await this.prisma.subscription.update({
          where: { id: sub.id },
          data: { currentPeriodEnd: addDays(sub.currentPeriodEnd, sub.plan.periodDays) },
        });
        await this.prisma.subscriptionPayment.create({
          data: {
            subscriptionId: sub.id,
            amount: sub.plan.price,
            status: SubscriptionPaymentStatus.SUCCEEDED,
            providerPaymentId: charge.providerPaymentId,
          },
        });
      } else {
        await this.prisma.subscription.update({ where: { id: sub.id }, data: { status: SubscriptionStatus.PAST_DUE } });
        await this.prisma.subscriptionPayment.create({
          data: { subscriptionId: sub.id, amount: sub.plan.price, status: SubscriptionPaymentStatus.FAILED },
        });
      }
    }
  }
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

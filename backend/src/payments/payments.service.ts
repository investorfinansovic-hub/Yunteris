import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

/**
 * MVP stub: simulates a payment provider (ЮKassa) locally so the rest of the
 * flow (order -> hold -> release/refund) can be built and tested end-to-end
 * before real payment credentials exist.
 *
 * TODO before production: replace hold/release/refund bodies with real
 * ЮKassa API calls (two-stage payments: create with capture=false, then
 * capture/cancel), driven by YOOKASSA_SHOP_ID / YOOKASSA_SECRET_KEY, and
 * verify webhooks instead of trusting the caller.
 */
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private prisma: PrismaService) {}

  async holdPayment(orderId: string, amount: number) {
    this.logger.log(`Holding ${amount} RUB for order ${orderId} (stub provider)`);
    return this.prisma.payment.create({
      data: {
        orderId,
        amount,
        status: PaymentStatus.HELD,
        provider: 'stub',
      },
    });
  }

  async releasePayment(orderId: string) {
    this.logger.log(`Releasing payment for order ${orderId} to cleaner (stub provider)`);
    return this.prisma.payment.update({
      where: { orderId },
      data: { status: PaymentStatus.RELEASED },
    });
  }

  async refundPayment(orderId: string) {
    this.logger.log(`Refunding payment for order ${orderId} to client (stub provider)`);
    return this.prisma.payment.update({
      where: { orderId },
      data: { status: PaymentStatus.REFUNDED },
    });
  }
}

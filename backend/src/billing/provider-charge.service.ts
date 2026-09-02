import { Injectable, Logger } from '@nestjs/common';

export interface ChargeResult {
  success: boolean;
  providerPaymentId: string;
}

/**
 * Stands in for a real recurring-billing gateway (ЮKassa "автоплатежи"/rebilling).
 *
 * Real flow to implement here later:
 *  1. First charge: create a ЮKassa payment with `save_payment_method: true`,
 *     redirect the cleaner to confirm it with their card, receive a webhook,
 *     and store the returned `payment_method_id` on the Subscription row.
 *  2. Renewal charges: create a payment with `payment_method_id` +
 *     `capture: true` referencing the saved method — no redirect needed, this
 *     is what makes it a true monthly autopayment.
 *
 * Both need a live ЮKassa merchant account (YOOKASSA_SHOP_ID / YOOKASSA_SECRET_KEY)
 * with recurring payments enabled on the contract — that's a business step, not
 * a code one, so this stub always "succeeds" to keep the rest of the flow testable.
 */
@Injectable()
export class ProviderChargeService {
  private readonly logger = new Logger(ProviderChargeService.name);

  async chargeFirst(cleanerId: string, amount: number): Promise<ChargeResult> {
    this.logger.log(`[stub] First subscription charge of ${amount} RUB for cleaner ${cleanerId}`);
    return { success: true, providerPaymentId: `stub_${Date.now()}` };
  }

  async chargeRecurring(subscriptionId: string, amount: number): Promise<ChargeResult> {
    this.logger.log(`[stub] Recurring subscription charge of ${amount} RUB for subscription ${subscriptionId}`);
    return { success: true, providerPaymentId: `stub_${Date.now()}` };
  }
}

import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionPlansController } from './subscription-plans.controller';
import { BillingModule } from '../billing/billing.module';

@Module({
  imports: [BillingModule],
  providers: [SubscriptionsService],
  controllers: [SubscriptionsController, SubscriptionPlansController],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}

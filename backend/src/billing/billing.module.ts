import { Module } from '@nestjs/common';
import { ProviderChargeService } from './provider-charge.service';

@Module({
  providers: [ProviderChargeService],
  exports: [ProviderChargeService],
})
export class BillingModule {}

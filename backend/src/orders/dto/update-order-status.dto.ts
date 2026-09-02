import { IsIn } from 'class-validator';

export const CLEANER_STATUS_TRANSITIONS = ['EN_ROUTE', 'IN_PROGRESS', 'COMPLETED'] as const;

export class UpdateOrderStatusDto {
  @IsIn(CLEANER_STATUS_TRANSITIONS)
  status: (typeof CLEANER_STATUS_TRANSITIONS)[number];
}

export type Role = 'CLIENT' | 'CLEANER' | 'ADMIN';

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'SEARCHING'
  | 'ASSIGNED'
  | 'EN_ROUTE'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

export interface AuthUser {
  id: string;
  name: string;
  role: Role;
}

export interface ServiceOption {
  id: string;
  code: string;
  name: string;
  price: number;
}

export interface Service {
  id: string;
  code: string;
  name: string;
  basePrice: number;
  description?: string | null;
  options: ServiceOption[];
}

export interface OrderOptionLink {
  option: ServiceOption;
}

export interface Order {
  id: string;
  status: OrderStatus;
  address: string;
  district: string;
  scheduledAt: string;
  price: number;
  service: Service;
  options: OrderOptionLink[];
  client?: { id: string; name: string; phone: string };
  cleaner?: { id: string; name: string; phone: string } | null;
  createdAt: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Ожидает оплаты',
  SEARCHING: 'Ищем исполнителя',
  ASSIGNED: 'Исполнитель назначен',
  EN_ROUTE: 'Исполнитель в пути',
  IN_PROGRESS: 'Уборка идёт',
  COMPLETED: 'Завершено',
  CANCELLED: 'Отменено',
  DISPUTED: 'Спор',
};

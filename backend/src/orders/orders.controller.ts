import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CurrentUser, AuthUser } from '../common/current-user.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @Roles(Role.CLIENT)
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user.userId, dto);
  }

  @Get('feed')
  @Roles(Role.CLEANER)
  feed(@CurrentUser() user: AuthUser) {
    return this.ordersService.feed(user.userId);
  }

  @Post(':id/accept')
  @Roles(Role.CLEANER)
  accept(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.ordersService.accept(id, user.userId);
  }

  @Patch(':id/status')
  @Roles(Role.CLEANER)
  updateStatus(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, user.userId, dto.status);
  }

  @Get('mine')
  listMine(@CurrentUser() user: AuthUser) {
    return this.ordersService.listMine(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }
}

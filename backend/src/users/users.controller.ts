import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { IsArray, IsString } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../common/current-user.decorator';
import { UsersService } from './users.service';

class UpdateServiceAreasDto {
  @IsArray()
  @IsString({ each: true })
  serviceAreas: string[];
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.usersService.getProfile(user.userId);
  }

  @Patch('me/service-areas')
  updateServiceAreas(@CurrentUser() user: AuthUser, @Body() dto: UpdateServiceAreasDto) {
    return this.usersService.updateCleanerServiceAreas(user.userId, dto.serviceAreas);
  }
}

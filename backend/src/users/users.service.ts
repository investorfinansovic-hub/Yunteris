import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { cleanerProfile: true },
    });
    if (!user) throw new NotFoundException('Пользователь не найден');
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async updateCleanerServiceAreas(userId: string, serviceAreas: string[]) {
    return this.prisma.cleanerProfile.update({
      where: { userId },
      data: { serviceAreas },
    });
  }
}

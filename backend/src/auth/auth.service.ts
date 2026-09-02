import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (existing) throw new ConflictException('Пользователь с таким номером телефона уже зарегистрирован');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        name: dto.name,
        role: dto.role,
        passwordHash,
        ...(dto.role === Role.CLEANER ? { cleanerProfile: { create: {} } } : {}),
      },
    });

    return this.buildAuthResponse(user.id, user.role, user.name);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (!user) throw new UnauthorizedException('Неверный телефон или пароль');

    const passwordOk = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordOk) throw new UnauthorizedException('Неверный телефон или пароль');

    return this.buildAuthResponse(user.id, user.role, user.name);
  }

  private buildAuthResponse(userId: string, role: Role, name: string) {
    const accessToken = this.jwt.sign({ sub: userId, role });
    return { accessToken, user: { id: userId, role, name } };
  }
}

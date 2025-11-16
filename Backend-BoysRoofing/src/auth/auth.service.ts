import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  // Crea el usuario admin si no existe (usando los valores del .env)
  private async ensureAdminUser() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.warn('ADMIN_EMAIL o ADMIN_PASSWORD no están definidos en .env');
      return;
    }

    const existing = await this.prisma.adminUser.findUnique({ where: { email } });

    if (!existing) {
      const hash = await bcrypt.hash(password, 10);
      await this.prisma.adminUser.create({
        data: {
          email,
          password: hash,
        },
      });
      console.log('✅ AdminUser creado con email:', email);
    }
  }

  async login(email: string, password: string) {
    // Asegurarnos que el admin por defecto exista
    await this.ensureAdminUser();

    const user = await this.prisma.adminUser.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const access_token = await this.jwt.signAsync(payload);

    return { access_token };
  }
}

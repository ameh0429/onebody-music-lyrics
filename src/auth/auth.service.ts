import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import { User } from '../database/models';
import { LoginDto, RegisterDto, UpdatePasswordDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private readonly users: typeof User,
    private readonly jwt: JwtService,
  ) {}
  private token(user: User) {
    return this.jwt.signAsync({ id: user.id, email: user.email, role: user.role });
  }
  async register(dto: RegisterDto) {
    if (await this.users.findOne({ where: { email: dto.email } }))
      throw new BadRequestException('User already exists with this email');
    const user = await this.users.create({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: 'user',
    });
    return {
      success: true,
      message: 'User registered successfully',
      data: { user, token: await this.token(user) },
    };
  }
  async login(dto: LoginDto) {
    const user = await this.users.findOne({ where: { email: dto.email } });
    if (!user || !(await user.comparePassword(dto.password)))
      throw new UnauthorizedException('Invalid email or password');
    return {
      success: true,
      message: 'Login successful',
      data: { user, token: await this.token(user) },
    };
  }
  async updatePassword(user: User, dto: UpdatePasswordDto) {
    if (!(await user.comparePassword(dto.currentPassword)))
      throw new UnauthorizedException('Current password is incorrect');
    await user.update({ password: dto.newPassword });
    return {
      success: true,
      message: 'Password updated successfully',
      data: { token: await this.token(user) },
    };
  }
}

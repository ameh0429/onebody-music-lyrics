import { Body, Controller, Get, HttpCode, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, UpdatePasswordDto } from './auth.dto';
import { AuthenticatedRequest, JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('register')
  @ApiOperation({ summary: 'Register a user account' })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login and obtain a bearer token' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the signed-in user' })
  me(@Req() req: AuthenticatedRequest) {
    return { success: true, data: req.user };
  }
  @Put('update-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change your password' })
  updatePassword(@Req() req: AuthenticatedRequest, @Body() dto: UpdatePasswordDto) {
    return this.auth.updatePassword(req.user, dto);
  }
}

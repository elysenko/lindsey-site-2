import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AdminGuard } from './admin.guard';
import { CurrentUser } from './current-user.decorator';
import { SessionPayload, SESSION_COOKIE } from './session.types';
import { getClientIp } from '../common/client-ip.util';

@ApiTags('admin-auth')
@Controller('admin')
export class AdminAuthController {
  constructor(private readonly auth: AuthService) {}

  private cookieOptions() {
    const maxAgeDays = 1;
    return {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: maxAgeDays * 24 * 60 * 60 * 1000,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login — issues an httpOnly session cookie' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: Omit<SessionPayload, 'userId'> & { id: string } }> {
    const ip = getClientIp(req);
    const { token, user } = await this.auth.login(dto.email, dto.password, ip);
    res.cookie(SESSION_COOKIE, token, this.cookieOptions());
    return { user: { id: user.userId, email: user.email, role: user.role } };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin logout — clears the session cookie' })
  logout(@Res({ passthrough: true }) res: Response): { ok: true } {
    res.clearCookie(SESSION_COOKIE, { path: '/' });
    return { ok: true };
  }

  @Get('me')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Current authenticated admin' })
  me(@CurrentUser() user: SessionPayload): {
    id: string;
    email: string;
    role: string;
  } {
    return { id: user.userId, email: user.email, role: user.role };
  }
}

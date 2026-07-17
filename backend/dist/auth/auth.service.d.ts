import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { SessionPayload } from './session.types';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly email;
    private readonly logger;
    constructor(prisma: PrismaService, jwt: JwtService, email: EmailService);
    hashPassword(plain: string): Promise<string>;
    verifyPassword(plain: string, hash: string): Promise<boolean>;
    signSession(payload: SessionPayload): string;
    verifySession(token: string): SessionPayload;
    private recentFailures;
    login(email: string, password: string, ip: string | null): Promise<{
        token: string;
        user: SessionPayload;
    }>;
    private dispatchResetEmail;
}

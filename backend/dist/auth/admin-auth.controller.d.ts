import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SessionPayload } from './session.types';
export declare class AdminAuthController {
    private readonly auth;
    constructor(auth: AuthService);
    private cookieOptions;
    login(dto: LoginDto, req: Request, res: Response): Promise<{
        user: Omit<SessionPayload, 'userId'> & {
            id: string;
        };
    }>;
    logout(res: Response): {
        ok: true;
    };
    me(user: SessionPayload): {
        id: string;
        email: string;
        role: string;
    };
}

import { Request } from 'express';
export interface SessionPayload {
    userId: string;
    email: string;
    role: 'ADMIN' | 'USER';
}
export interface AuthedRequest extends Request {
    user?: SessionPayload;
}
export declare const SESSION_COOKIE = "session";

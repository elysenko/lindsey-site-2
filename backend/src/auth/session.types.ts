import { Request } from 'express';

/** Payload signed into the httpOnly session JWT. */
export interface SessionPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

/** Express request augmented with the resolved session by the auth guards. */
export interface AuthedRequest extends Request {
  user?: SessionPayload;
}

export const SESSION_COOKIE = 'session';

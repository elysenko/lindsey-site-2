import { Request } from 'express';

/**
 * Best-effort client IP extraction. Behind nginx the real client address is in
 * X-Forwarded-For (first entry); fall back to the socket address for local/dev.
 */
export function getClientIp(req: Request): string {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length > 0) {
    return xff.split(',')[0].trim();
  }
  if (Array.isArray(xff) && xff.length > 0) {
    return xff[0].split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { db } from '@/lib/db';
import { consultationSchema } from '@/lib/validation';
import { sanitizeText, sanitizeOptional, sanitizeArray } from '@/lib/sanitize';
import { withRoute, json, error, clientIp } from '@/lib/http';
import { consultationRateLimit } from '@/lib/rateLimit';
import { sendEmail } from '@/lib/email';
import { resolveConfig } from '@/lib/config';

export const dynamic = 'force-dynamic';

async function notifyAdmin(lead: { fullName: string; email: string; briefToken: string }): Promise<void> {
  const to =
    process.env.ADMIN_EMAIL ||
    (await resolveConfig('SMTP_FROM')) ||
    'admin@lebarregroup.com';
  await sendEmail(
    to,
    `New consultation lead: ${lead.fullName}`,
    `A new consultation request was submitted.\n\n` +
      `Name: ${lead.fullName}\nEmail: ${lead.email}\n\n` +
      `Brand brief link token: ${lead.briefToken}\n`,
  );
}

export const POST = withRoute(async (req: Request): Promise<NextResponse> => {
  const ip = clientIp(req);

  // Rate limit: 5 submissions / 60 min / IP.
  const rl = await consultationRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.', retryAfter: rl.retryAfterSeconds },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } },
    );
  }

  const body = await req.json().catch(() => ({}));
  const data = consultationSchema.parse(body);

  const briefToken = randomUUID();
  const lead = await db.lead.create({
    data: {
      fullName: sanitizeText(data.fullName),
      organization: sanitizeOptional(data.organization),
      email: sanitizeText(data.email).toLowerCase(),
      phone: sanitizeOptional(data.phone),
      serviceInterest: sanitizeOptional(data.serviceInterest),
      challengeCategories: sanitizeArray(data.challengeCategories),
      situationDescription: sanitizeOptional(data.situationDescription),
      briefToken,
      ip,
    },
  });

  // Never fail the lead capture because email is down — sendEmail enqueues on failure.
  await notifyAdmin({ fullName: lead.fullName, email: lead.email, briefToken });

  return json({ briefToken, leadId: lead.id }, 201);
});

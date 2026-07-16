import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { signupSchema } from '@/lib/validation';
import { hashPassword, setSessionCookie } from '@/lib/session';
import { withRoute, json, error } from '@/lib/http';

export const dynamic = 'force-dynamic';

// full_auth: first-ever signup becomes ADMIN, all subsequent users are USER.
export const POST = withRoute(async (req: Request): Promise<NextResponse> => {
  const body = await req.json().catch(() => ({}));
  const { email, password } = signupSchema.parse(body);
  const normalizedEmail = email.toLowerCase();

  const passwordHash = await hashPassword(password);

  try {
    const user = await db.$transaction(async (tx) => {
      const count = await tx.user.count();
      const role = count === 0 ? 'ADMIN' : 'USER';
      return tx.user.create({
        data: { email: normalizedEmail, password: passwordHash, role },
      });
    });

    await setSessionCookie({ userId: user.id, email: user.email, role: user.role });
    return json({ id: user.id, email: user.email, role: user.role }, 201);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return error('An account with this email already exists', 409);
    }
    throw err;
  }
});

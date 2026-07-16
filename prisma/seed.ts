import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

/**
 * Idempotent seed: ensures a bootstrap ADMIN user exists.
 * Credentials come from ADMIN_EMAIL / ADMIN_PASSWORD env vars.
 * Safe to run repeatedly (upsert). Team/service/FAQ content is code-managed
 * in src/content and does not require seeding.
 */
async function main() {
  const email = (process.env.ADMIN_EMAIL || 'admin@lebarregroup.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe!123';
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await db.user.upsert({
    where: { email },
    update: { role: 'ADMIN' },
    create: { email, password: passwordHash, role: 'ADMIN' },
  });

  console.log(`[seed] admin user ready: ${admin.email} (${admin.role})`);
}

main()
  .catch((err) => {
    console.error('[seed] failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

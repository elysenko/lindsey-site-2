// Runs once per server start (Next.js instrumentation hook), outside the
// request cycle. Seeds system settings from environment variables.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { bootstrapSettingsFromEnv } = await import('./lib/bootstrap-settings');
    await bootstrapSettingsFromEnv();
  }
}

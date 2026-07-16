import SettingsPanel from '@/components/admin/SettingsPanel';

export const dynamic = 'force-dynamic';

export default function AdminSettingsPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-1 text-ink-muted">
        Configure service and integration credentials. Values set here are stored securely and take
        effect immediately; environment variables take priority when present.
      </p>
      <div className="mt-6">
        <SettingsPanel />
      </div>
    </div>
  );
}

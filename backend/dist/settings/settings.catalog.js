"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SETTINGS_CATALOG = void 0;
exports.SETTINGS_CATALOG = [
    { key: 'DATABASE_URL', label: 'PostgreSQL connection URL', group: 'PostgreSQL', secret: true },
    { key: 'POSTGRESQL_API_KEY', label: 'PostgreSQL API key (alias)', group: 'PostgreSQL', secret: true },
    { key: 'MINIO_ENDPOINT', label: 'MinIO endpoint', group: 'MinIO', secret: false },
    { key: 'MINIO_API_KEY', label: 'MinIO API key', group: 'MinIO', secret: true },
    { key: 'CAL_COM_EMBED_API_KEY', label: 'Cal.com embed API key', group: 'Cal.com', secret: true },
    { key: 'CAL_COM_EMBED_LINK', label: 'Cal.com booking link', group: 'Cal.com', secret: false },
    { key: 'SMTP_VIA_NODEMAILER_API_KEY', label: 'SMTP (Nodemailer) API key', group: 'SMTP', secret: true },
    { key: 'SMTP_HOST', label: 'SMTP host', group: 'SMTP', secret: false },
    { key: 'SMTP_PORT', label: 'SMTP port', group: 'SMTP', secret: false },
    { key: 'SMTP_USER', label: 'SMTP username', group: 'SMTP', secret: false },
    { key: 'SMTP_PASS', label: 'SMTP password', group: 'SMTP', secret: true },
    { key: 'SMTP_FROM', label: 'SMTP from address', group: 'SMTP', secret: false },
];
//# sourceMappingURL=settings.catalog.js.map
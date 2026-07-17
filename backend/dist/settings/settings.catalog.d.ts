export interface SettingDescriptor {
    key: string;
    label: string;
    group: 'PostgreSQL' | 'MinIO' | 'Cal.com' | 'SMTP';
    secret: boolean;
}
export declare const SETTINGS_CATALOG: SettingDescriptor[];

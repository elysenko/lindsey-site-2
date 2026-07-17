import { PrismaService } from '../prisma/prisma.service';
import { AppConfigService } from '../config/app-config.service';
export interface OutgoingEmail {
    to: string;
    subject: string;
    body: string;
}
export declare class EmailService {
    private readonly prisma;
    private readonly config;
    private readonly logger;
    constructor(prisma: PrismaService, config: AppConfigService);
    private buildTransport;
    private fromAddress;
    send(email: OutgoingEmail): Promise<boolean>;
    enqueue(email: OutgoingEmail, lastError?: string): Promise<void>;
    drainOutbox(): Promise<{
        processed: number;
        sent: number;
        failed: number;
        skipped: number;
    }>;
}

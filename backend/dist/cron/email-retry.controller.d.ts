import { EmailService } from '../email/email.service';
export declare class EmailRetryController {
    private readonly email;
    constructor(email: EmailService);
    retry(): Promise<{
        processed: number;
        sent: number;
        failed: number;
        skipped: number;
    }>;
}

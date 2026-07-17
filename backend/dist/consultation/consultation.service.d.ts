import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { AppConfigService } from '../config/app-config.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
export declare class ConsultationService {
    private readonly prisma;
    private readonly email;
    private readonly config;
    private readonly logger;
    constructor(prisma: PrismaService, email: EmailService, config: AppConfigService);
    private generateToken;
    private uniqueToken;
    create(dto: CreateConsultationDto, ip: string | null): Promise<{
        briefToken: string;
    }>;
    private notifyAdmin;
}

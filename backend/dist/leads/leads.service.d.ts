import { PrismaService } from '../prisma/prisma.service';
import { ListLeadsDto } from './dto/list-leads.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
export declare class LeadsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: ListLeadsDto): Promise<{
        items: {
            id: string;
            createdAt: Date;
            email: string;
            fullName: string;
            organization: string | null;
            serviceInterest: string | null;
            challengeCategories: string[];
            briefStatus: import(".prisma/client").$Enums.BriefStatus;
            leadStatus: import(".prisma/client").$Enums.LeadStatus;
        }[];
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<{
        brief: {
            updatedAt: Date;
            id: string;
            createdAt: Date;
            mission: string | null;
            vision: string | null;
            differentiator: string | null;
            brandStory: string | null;
            audiences: string | null;
            brandVoice: string | null;
            successDefinition: string | null;
            leadId: string;
            completedAt: Date | null;
        } | null;
        notes: ({
            author: {
                email: string;
            };
        } & {
            updatedAt: Date;
            id: string;
            body: string;
            createdAt: Date;
            leadId: string;
            authorId: string;
        })[];
        audits: {
            id: string;
            leadId: string;
            editedAt: Date;
            field: string;
            oldValue: string | null;
            newValue: string | null;
            adminId: string;
        }[];
    } & {
        updatedAt: Date;
        id: string;
        createdAt: Date;
        email: string;
        ip: string | null;
        fullName: string;
        organization: string | null;
        phone: string | null;
        serviceInterest: string | null;
        challengeCategories: string[];
        situationDescription: string | null;
        briefToken: string;
        briefStatus: import(".prisma/client").$Enums.BriefStatus;
        leadStatus: import(".prisma/client").$Enums.LeadStatus;
    }>;
    update(id: string, dto: UpdateLeadDto, adminId: string): Promise<{
        brief: {
            updatedAt: Date;
            id: string;
            createdAt: Date;
            mission: string | null;
            vision: string | null;
            differentiator: string | null;
            brandStory: string | null;
            audiences: string | null;
            brandVoice: string | null;
            successDefinition: string | null;
            leadId: string;
            completedAt: Date | null;
        } | null;
        notes: ({
            author: {
                email: string;
            };
        } & {
            updatedAt: Date;
            id: string;
            body: string;
            createdAt: Date;
            leadId: string;
            authorId: string;
        })[];
        audits: {
            id: string;
            leadId: string;
            editedAt: Date;
            field: string;
            oldValue: string | null;
            newValue: string | null;
            adminId: string;
        }[];
    } & {
        updatedAt: Date;
        id: string;
        createdAt: Date;
        email: string;
        ip: string | null;
        fullName: string;
        organization: string | null;
        phone: string | null;
        serviceInterest: string | null;
        challengeCategories: string[];
        situationDescription: string | null;
        briefToken: string;
        briefStatus: import(".prisma/client").$Enums.BriefStatus;
        leadStatus: import(".prisma/client").$Enums.LeadStatus;
    }>;
}

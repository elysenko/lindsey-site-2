import { InsightsService } from './insights.service';
import { CreateInsightDto, UpdateInsightDto } from './dto/insights.dto';
import { SessionPayload } from '../auth/session.types';
export declare class AdminInsightsController {
    private readonly insights;
    constructor(insights: InsightsService);
    list(): Promise<{
        updatedAt: Date;
        id: string;
        status: import(".prisma/client").$Enums.PostStatus;
        title: string;
        slug: string;
        publishedAt: Date | null;
    }[]>;
    get(id: string): Promise<{
        updatedAt: Date;
        id: string;
        body: string;
        status: import(".prisma/client").$Enums.PostStatus;
        createdAt: Date;
        title: string;
        slug: string;
        authorId: string;
        publishedAt: Date | null;
    }>;
    create(dto: CreateInsightDto, user: SessionPayload): Promise<{
        updatedAt: Date;
        id: string;
        body: string;
        status: import(".prisma/client").$Enums.PostStatus;
        createdAt: Date;
        title: string;
        slug: string;
        authorId: string;
        publishedAt: Date | null;
    }>;
    update(id: string, dto: UpdateInsightDto): Promise<{
        updatedAt: Date;
        id: string;
        body: string;
        status: import(".prisma/client").$Enums.PostStatus;
        createdAt: Date;
        title: string;
        slug: string;
        authorId: string;
        publishedAt: Date | null;
    }>;
}

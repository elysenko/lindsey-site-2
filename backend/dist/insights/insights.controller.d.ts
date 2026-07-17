import { InsightsService } from './insights.service';
import { ListInsightsDto } from './dto/insights.dto';
export declare class InsightsController {
    private readonly insights;
    constructor(insights: InsightsService);
    list(query: ListInsightsDto): Promise<{
        items: {
            slug: string;
            title: string;
            excerpt: string;
            publishedAt: Date | null;
            updatedAt: Date;
        }[];
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    }>;
    get(slug: string): Promise<{
        author: {
            email: string;
        };
    } & {
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

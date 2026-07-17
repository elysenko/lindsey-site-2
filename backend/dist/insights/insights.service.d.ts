import { PrismaService } from '../prisma/prisma.service';
import { CreateInsightDto, ListInsightsDto, UpdateInsightDto } from './dto/insights.dto';
export declare class InsightsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private wordCount;
    private slugify;
    private excerpt;
    listPublished(query: ListInsightsDto): Promise<{
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
    getPublishedBySlug(slug: string): Promise<{
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
    adminList(): Promise<{
        updatedAt: Date;
        id: string;
        status: import(".prisma/client").$Enums.PostStatus;
        title: string;
        slug: string;
        publishedAt: Date | null;
    }[]>;
    adminGet(id: string): Promise<{
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
    private assertPublishable;
    create(dto: CreateInsightDto, authorId: string): Promise<{
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
    private assertSlugFree;
}

import { PrismaService } from '../prisma/prisma.service';
export declare class TeamController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(): import(".prisma/client").Prisma.PrismaPromise<{
        updatedAt: Date;
        id: string;
        createdAt: Date;
        title: string;
        slug: string;
        fullName: string;
        credentials: string | null;
        honorificPrefix: string | null;
        bio: string;
        expertise: string[];
        affiliations: string | null;
        headshotUrl: string | null;
        linkedinUrl: string | null;
        education: string | null;
        skills: string[];
    }[]>;
    get(slug: string): Promise<{
        updatedAt: Date;
        id: string;
        createdAt: Date;
        title: string;
        slug: string;
        fullName: string;
        credentials: string | null;
        honorificPrefix: string | null;
        bio: string;
        expertise: string[];
        affiliations: string | null;
        headshotUrl: string | null;
        linkedinUrl: string | null;
        education: string | null;
        skills: string[];
    }>;
}

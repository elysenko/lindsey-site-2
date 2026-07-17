import { BriefService } from './brief.service';
import { SubmitBriefDto } from './dto/submit-brief.dto';
export declare class BriefController {
    private readonly brief;
    constructor(brief: BriefService);
    get(token: string): Promise<{
        lead: {
            id: string;
            fullName: string;
            organization: string | null;
            email: string;
            serviceInterest: string | null;
            challengeCategories: string[];
            briefStatus: "PENDING" | "COMPLETED";
        };
        brief: {
            mission: string | null;
            vision: string | null;
            differentiator: string | null;
            brandStory: string | null;
            audiences: string | null;
            brandVoice: string | null;
            successDefinition: string | null;
            completedAt: Date | null;
        } | null;
    }>;
    submit(token: string, dto: SubmitBriefDto): Promise<{
        ok: boolean;
        completedAt: Date;
    }>;
}

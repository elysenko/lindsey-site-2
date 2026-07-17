"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BriefService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BriefService = class BriefService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getByToken(token) {
        const lead = await this.prisma.lead.findUnique({
            where: { briefToken: token },
            include: { brief: true },
        });
        if (!lead || lead.briefStatus === 'SUPERSEDED') {
            throw new common_1.NotFoundException('Brief not found');
        }
        return {
            lead: {
                id: lead.id,
                fullName: lead.fullName,
                organization: lead.organization,
                email: lead.email,
                serviceInterest: lead.serviceInterest,
                challengeCategories: lead.challengeCategories,
                briefStatus: lead.briefStatus,
            },
            brief: lead.brief
                ? {
                    mission: lead.brief.mission,
                    vision: lead.brief.vision,
                    differentiator: lead.brief.differentiator,
                    brandStory: lead.brief.brandStory,
                    audiences: lead.brief.audiences,
                    brandVoice: lead.brief.brandVoice,
                    successDefinition: lead.brief.successDefinition,
                    completedAt: lead.brief.completedAt,
                }
                : null,
        };
    }
    async submit(token, dto) {
        const lead = await this.prisma.lead.findUnique({
            where: { briefToken: token },
            select: { id: true, briefStatus: true },
        });
        if (!lead || lead.briefStatus === 'SUPERSEDED') {
            throw new common_1.NotFoundException('Brief not found');
        }
        const now = new Date();
        const data = {
            mission: dto.mission ?? null,
            vision: dto.vision ?? null,
            differentiator: dto.differentiator ?? null,
            brandStory: dto.brandStory ?? null,
            audiences: dto.audiences ?? null,
            brandVoice: dto.brandVoice ?? null,
            successDefinition: dto.successDefinition ?? null,
            completedAt: now,
        };
        await this.prisma.$transaction([
            this.prisma.brandBrief.upsert({
                where: { leadId: lead.id },
                update: data,
                create: { leadId: lead.id, ...data },
            }),
            this.prisma.lead.update({
                where: { id: lead.id },
                data: { briefStatus: 'COMPLETED' },
            }),
        ]);
        return { ok: true, completedAt: now };
    }
};
exports.BriefService = BriefService;
exports.BriefService = BriefService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BriefService);
//# sourceMappingURL=brief.service.js.map
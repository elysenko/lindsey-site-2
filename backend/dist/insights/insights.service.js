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
exports.InsightsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const insights_dto_1 = require("./dto/insights.dto");
const MIN_WORDS = 1500;
let InsightsService = class InsightsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    wordCount(body) {
        return body.trim().split(/\s+/).filter(Boolean).length;
    }
    slugify(input) {
        return input
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 120);
    }
    excerpt(body, words = 40) {
        return body.trim().split(/\s+/).slice(0, words).join(' ');
    }
    async listPublished(query) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 10;
        const where = { status: 'PUBLISHED' };
        const [total, posts] = await this.prisma.$transaction([
            this.prisma.insightsPost.count({ where }),
            this.prisma.insightsPost.findMany({
                where,
                orderBy: { publishedAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
                select: {
                    slug: true,
                    title: true,
                    body: true,
                    publishedAt: true,
                    updatedAt: true,
                },
            }),
        ]);
        return {
            items: posts.map((p) => ({
                slug: p.slug,
                title: p.title,
                excerpt: this.excerpt(p.body),
                publishedAt: p.publishedAt,
                updatedAt: p.updatedAt,
            })),
            page,
            pageSize,
            total,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
        };
    }
    async getPublishedBySlug(slug) {
        const post = await this.prisma.insightsPost.findFirst({
            where: { slug, status: 'PUBLISHED' },
            include: { author: { select: { email: true } } },
        });
        if (!post)
            throw new common_1.NotFoundException('Insight not found');
        return post;
    }
    async adminList() {
        return this.prisma.insightsPost.findMany({
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true,
                slug: true,
                title: true,
                status: true,
                publishedAt: true,
                updatedAt: true,
            },
        });
    }
    async adminGet(id) {
        const post = await this.prisma.insightsPost.findUnique({ where: { id } });
        if (!post)
            throw new common_1.NotFoundException('Insight not found');
        return post;
    }
    assertPublishable(body) {
        const words = this.wordCount(body);
        if (words < MIN_WORDS) {
            throw new common_1.BadRequestException(`Published insights must be at least ${MIN_WORDS} words (current: ${words}).`);
        }
    }
    async create(dto, authorId) {
        const status = dto.status ?? insights_dto_1.PostStatusDto.DRAFT;
        if (status === insights_dto_1.PostStatusDto.PUBLISHED) {
            this.assertPublishable(dto.body);
        }
        const slug = dto.slug ? this.slugify(dto.slug) : this.slugify(dto.title);
        await this.assertSlugFree(slug);
        return this.prisma.insightsPost.create({
            data: {
                title: dto.title,
                body: dto.body,
                slug,
                status,
                authorId,
                publishedAt: status === insights_dto_1.PostStatusDto.PUBLISHED ? new Date() : null,
            },
        });
    }
    async update(id, dto) {
        const existing = await this.prisma.insightsPost.findUnique({
            where: { id },
        });
        if (!existing)
            throw new common_1.NotFoundException('Insight not found');
        const nextStatus = dto.status ?? existing.status;
        const nextBody = dto.body ?? existing.body;
        if (nextStatus === 'PUBLISHED') {
            this.assertPublishable(nextBody);
        }
        const data = {};
        if (dto.title !== undefined)
            data.title = dto.title;
        if (dto.body !== undefined)
            data.body = dto.body;
        if (dto.slug !== undefined) {
            const slug = this.slugify(dto.slug);
            if (slug !== existing.slug) {
                await this.assertSlugFree(slug, id);
            }
            data.slug = slug;
        }
        if (dto.status !== undefined)
            data.status = dto.status;
        if (nextStatus === 'PUBLISHED' && !existing.publishedAt) {
            data.publishedAt = new Date();
        }
        return this.prisma.insightsPost.update({ where: { id }, data });
    }
    async assertSlugFree(slug, exceptId) {
        const clash = await this.prisma.insightsPost.findUnique({
            where: { slug },
            select: { id: true },
        });
        if (clash && clash.id !== exceptId) {
            throw new common_1.ConflictException(`Slug "${slug}" is already in use.`);
        }
    }
};
exports.InsightsService = InsightsService;
exports.InsightsService = InsightsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InsightsService);
//# sourceMappingURL=insights.service.js.map
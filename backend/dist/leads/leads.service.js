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
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const list_leads_dto_1 = require("./dto/list-leads.dto");
const update_lead_dto_1 = require("./dto/update-lead.dto");
let LeadsService = class LeadsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 20;
        const where = {};
        if (query.status) {
            where.leadStatus = query.status;
        }
        if (query.challenge) {
            where.challengeCategories = { has: query.challenge };
        }
        const orderBy = {
            createdAt: query.sort === list_leads_dto_1.LeadSort.OLDEST ? 'asc' : 'desc',
        };
        const [total, items] = await this.prisma.$transaction([
            this.prisma.lead.count({ where }),
            this.prisma.lead.findMany({
                where,
                orderBy,
                skip: (page - 1) * pageSize,
                take: pageSize,
                select: {
                    id: true,
                    fullName: true,
                    organization: true,
                    email: true,
                    serviceInterest: true,
                    challengeCategories: true,
                    briefStatus: true,
                    leadStatus: true,
                    createdAt: true,
                },
            }),
        ]);
        return {
            items,
            page,
            pageSize,
            total,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
        };
    }
    async findOne(id) {
        const lead = await this.prisma.lead.findUnique({
            where: { id },
            include: {
                brief: true,
                notes: {
                    orderBy: { createdAt: 'desc' },
                    include: { author: { select: { email: true } } },
                },
                audits: { orderBy: { editedAt: 'desc' } },
            },
        });
        if (!lead)
            throw new common_1.NotFoundException('Lead not found');
        return lead;
    }
    async update(id, dto, adminId) {
        const lead = await this.prisma.lead.findUnique({
            where: { id },
            include: { brief: true },
        });
        if (!lead)
            throw new common_1.NotFoundException('Lead not found');
        const ops = [];
        if (dto.leadStatus) {
            ops.push(this.prisma.lead.update({
                where: { id },
                data: {
                    leadStatus: dto.leadStatus,
                },
            }));
        }
        if (dto.note && dto.note.trim().length > 0) {
            ops.push(this.prisma.leadNote.create({
                data: { leadId: id, authorId: adminId, body: dto.note.trim() },
            }));
        }
        if (dto.briefEdits && Object.keys(dto.briefEdits).length > 0) {
            const briefUpdate = {};
            const briefCreate = {};
            for (const field of update_lead_dto_1.EDITABLE_BRIEF_FIELDS) {
                const newValue = dto.briefEdits[field];
                if (newValue === undefined)
                    continue;
                const oldValue = lead.brief
                    ? (lead.brief[field] ??
                        null)
                    : null;
                if (oldValue === newValue)
                    continue;
                briefUpdate[field] = newValue;
                briefCreate[field] = newValue;
                ops.push(this.prisma.brandBriefAudit.create({
                    data: {
                        leadId: id,
                        field,
                        oldValue,
                        newValue,
                        adminId,
                    },
                }));
            }
            if (Object.keys(briefUpdate).length > 0) {
                ops.push(this.prisma.brandBrief.upsert({
                    where: { leadId: id },
                    update: briefUpdate,
                    create: { leadId: id, ...briefCreate },
                }));
            }
        }
        if (ops.length > 0) {
            await this.prisma.$transaction(ops);
        }
        return this.findOne(id);
    }
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeadsService);
//# sourceMappingURL=leads.service.js.map
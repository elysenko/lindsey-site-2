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
var ConsultationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsultationService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const app_config_service_1 = require("../config/app-config.service");
let ConsultationService = ConsultationService_1 = class ConsultationService {
    constructor(prisma, email, config) {
        this.prisma = prisma;
        this.email = email;
        this.config = config;
        this.logger = new common_1.Logger(ConsultationService_1.name);
    }
    generateToken() {
        return (0, crypto_1.randomBytes)(24).toString('base64url');
    }
    async uniqueToken() {
        for (let i = 0; i < 5; i++) {
            const token = this.generateToken();
            const existing = await this.prisma.lead.findUnique({
                where: { briefToken: token },
                select: { id: true },
            });
            if (!existing)
                return token;
        }
        return (0, crypto_1.randomBytes)(48).toString('base64url');
    }
    async create(dto, ip) {
        const briefToken = await this.uniqueToken();
        const lead = await this.prisma.lead.create({
            data: {
                fullName: dto.fullName,
                organization: dto.organization ?? null,
                email: dto.email.trim().toLowerCase(),
                phone: dto.phone ?? null,
                serviceInterest: dto.serviceInterest ?? null,
                challengeCategories: dto.challengeCategories,
                situationDescription: dto.situationDescription ?? null,
                briefToken,
                ip,
            },
        });
        void this.notifyAdmin(lead.id, dto);
        return { briefToken };
    }
    async notifyAdmin(leadId, dto) {
        try {
            const to = (await this.config.resolveConfig('LEAD_NOTIFY_EMAIL')) ||
                (await this.config.resolveConfig('ADMIN_EMAIL')) ||
                'admin@lebarregroup.com';
            const body = [
                `New consultation request (lead ${leadId})`,
                ``,
                `Name: ${dto.fullName}`,
                `Organization: ${dto.organization ?? '—'}`,
                `Email: ${dto.email}`,
                `Phone: ${dto.phone ?? '—'}`,
                `Service interest: ${dto.serviceInterest ?? '—'}`,
                `Challenges: ${dto.challengeCategories.join(', ')}`,
                ``,
                `Situation:`,
                dto.situationDescription ?? '—',
            ].join('\n');
            await this.email.send({
                to,
                subject: `New consultation request — ${dto.fullName}`,
                body,
            });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            this.logger.warn(`Admin notification failed: ${message}`);
        }
    }
};
exports.ConsultationService = ConsultationService;
exports.ConsultationService = ConsultationService = ConsultationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService,
        app_config_service_1.AppConfigService])
], ConsultationService);
//# sourceMappingURL=consultation.service.js.map
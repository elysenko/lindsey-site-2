"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
const prisma_service_1 = require("../prisma/prisma.service");
const app_config_service_1 = require("../config/app-config.service");
const MAX_ATTEMPTS = 5;
let EmailService = EmailService_1 = class EmailService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        this.logger = new common_1.Logger(EmailService_1.name);
    }
    async buildTransport() {
        const host = await this.config.resolveConfig('SMTP_HOST');
        const apiKey = await this.config.resolveConfig('SMTP_VIA_NODEMAILER_API_KEY');
        if (!host && !apiKey)
            return null;
        if (!host)
            return null;
        const port = parseInt((await this.config.resolveConfig('SMTP_PORT')) || '587', 10);
        const user = await this.config.resolveConfig('SMTP_USER');
        const pass = (await this.config.resolveConfig('SMTP_PASS')) || apiKey || undefined;
        return nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: user ? { user, pass } : undefined,
        });
    }
    async fromAddress() {
        return ((await this.config.resolveConfig('SMTP_FROM')) ||
            (await this.config.resolveConfig('SMTP_USER')) ||
            'no-reply@lebarregroup.com');
    }
    async send(email) {
        try {
            const transport = await this.buildTransport();
            if (!transport) {
                await this.enqueue(email, 'SMTP not configured');
                return false;
            }
            await transport.sendMail({
                from: await this.fromAddress(),
                to: email.to,
                subject: email.subject,
                text: email.body,
            });
            return true;
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            this.logger.warn(`Email send failed, queuing to outbox: ${message}`);
            await this.enqueue(email, message);
            return false;
        }
    }
    async enqueue(email, lastError) {
        try {
            await this.prisma.emailOutbox.create({
                data: {
                    to: email.to,
                    subject: email.subject,
                    body: email.body,
                    status: 'PENDING',
                    lastError: lastError ?? null,
                },
            });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            this.logger.error(`Failed to enqueue email to outbox: ${message}`);
        }
    }
    async drainOutbox() {
        const transport = await this.buildTransport();
        const candidates = await this.prisma.emailOutbox.findMany({
            where: { status: { in: ['PENDING', 'FAILED'] }, attempts: { lt: MAX_ATTEMPTS } },
            orderBy: { createdAt: 'asc' },
            take: 50,
        });
        let sent = 0;
        let failed = 0;
        let skipped = 0;
        const now = Date.now();
        for (const msg of candidates) {
            const backoffMs = Math.pow(2, msg.attempts) * 60_000;
            if (now - msg.updatedAt.getTime() < backoffMs) {
                skipped++;
                continue;
            }
            if (!transport) {
                await this.prisma.emailOutbox.update({
                    where: { id: msg.id },
                    data: {
                        attempts: { increment: 1 },
                        status: 'FAILED',
                        lastError: 'SMTP not configured',
                    },
                });
                failed++;
                continue;
            }
            try {
                await transport.sendMail({
                    from: await this.fromAddress(),
                    to: msg.to,
                    subject: msg.subject,
                    text: msg.body,
                });
                await this.prisma.emailOutbox.update({
                    where: { id: msg.id },
                    data: { status: 'SENT', attempts: { increment: 1 }, lastError: null },
                });
                sent++;
            }
            catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                await this.prisma.emailOutbox.update({
                    where: { id: msg.id },
                    data: {
                        status: 'FAILED',
                        attempts: { increment: 1 },
                        lastError: message,
                    },
                });
                failed++;
            }
        }
        return { processed: candidates.length, sent, failed, skipped };
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        app_config_service_1.AppConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map
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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const app_config_service_1 = require("../config/app-config.service");
const settings_catalog_1 = require("./settings.catalog");
let SettingsService = class SettingsService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
    }
    mask(value) {
        if (value.length <= 4)
            return '••••';
        return `${'•'.repeat(Math.min(8, value.length - 2))}${value.slice(-2)}`;
    }
    async list() {
        const rows = await this.prisma.systemSetting.findMany();
        const dbMap = new Map(rows.map((r) => [r.key, r.value]));
        return settings_catalog_1.SETTINGS_CATALOG.map((desc) => {
            const envRaw = process.env[desc.key];
            const envGood = !!envRaw && envRaw !== app_config_service_1.PLACEHOLDER;
            const dbRaw = dbMap.get(desc.key);
            const dbGood = !!dbRaw && dbRaw !== app_config_service_1.PLACEHOLDER;
            const effective = envGood ? envRaw : dbGood ? dbRaw : null;
            const source = envGood ? 'env' : dbGood ? 'db' : null;
            let display = null;
            if (effective) {
                display = desc.secret ? this.mask(effective) : effective;
            }
            return {
                key: desc.key,
                label: desc.label,
                group: desc.group,
                secret: desc.secret,
                configured: !!effective,
                source,
                value: display,
            };
        });
    }
    async update(entries) {
        const allowed = new Set(settings_catalog_1.SETTINGS_CATALOG.map((d) => d.key));
        for (const e of entries) {
            if (!allowed.has(e.key)) {
                throw new common_1.BadRequestException(`Unknown setting key: ${e.key}`);
            }
        }
        await this.prisma.$transaction(entries.map((e) => this.prisma.systemSetting.upsert({
            where: { key: e.key },
            update: { value: e.value },
            create: { key: e.key, value: e.value },
        })));
        return { updated: entries.length };
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        app_config_service_1.AppConfigService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map
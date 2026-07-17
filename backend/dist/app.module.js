"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const app_config_module_1 = require("./config/app-config.module");
const health_module_1 = require("./health/health.module");
const auth_module_1 = require("./auth/auth.module");
const email_module_1 = require("./email/email.module");
const content_module_1 = require("./content/content.module");
const consultation_module_1 = require("./consultation/consultation.module");
const brief_module_1 = require("./brief/brief.module");
const insights_module_1 = require("./insights/insights.module");
const leads_module_1 = require("./leads/leads.module");
const settings_module_1 = require("./settings/settings.module");
const seo_module_1 = require("./seo/seo.module");
const email_retry_controller_1 = require("./cron/email-retry.controller");
const cron_secret_guard_1 = require("./cron/cron-secret.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            app_config_module_1.AppConfigModule,
            email_module_1.EmailModule,
            auth_module_1.AuthModule,
            health_module_1.HealthModule,
            content_module_1.ContentModule,
            consultation_module_1.ConsultationModule,
            brief_module_1.BriefModule,
            insights_module_1.InsightsModule,
            leads_module_1.LeadsModule,
            settings_module_1.SettingsModule,
            seo_module_1.SeoModule,
        ],
        controllers: [email_retry_controller_1.EmailRetryController],
        providers: [cron_secret_guard_1.CronSecretGuard],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
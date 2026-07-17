import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AppConfigModule } from './config/app-config.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { ContentModule } from './content/content.module';
import { ConsultationModule } from './consultation/consultation.module';
import { BriefModule } from './brief/brief.module';
import { InsightsModule } from './insights/insights.module';
import { LeadsModule } from './leads/leads.module';
import { SettingsModule } from './settings/settings.module';
import { SeoModule } from './seo/seo.module';
import { EmailRetryController } from './cron/email-retry.controller';
import { CronSecretGuard } from './cron/cron-secret.guard';

/**
 * Application root. Wires every feature module (auth, lead funnel, admin CRM/CMS,
 * content, settings, health) plus the cron email-retry endpoint. Prisma, config,
 * auth and email are @Global so their providers are injectable app-wide.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AppConfigModule,
    EmailModule,
    AuthModule,
    HealthModule,
    ContentModule,
    ConsultationModule,
    BriefModule,
    InsightsModule,
    LeadsModule,
    SettingsModule,
    SeoModule,
  ],
  controllers: [EmailRetryController],
  providers: [CronSecretGuard],
})
export class AppModule {}

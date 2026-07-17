import { HealthCheckService, HealthCheckResult } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
export declare class HealthController {
    private readonly health;
    private readonly prisma;
    constructor(health: HealthCheckService, prisma: PrismaService);
    check(): Promise<HealthCheckResult>;
    private pingDatabase;
}

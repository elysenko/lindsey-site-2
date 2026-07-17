import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HealthCheckError,
  HealthIndicatorResult,
  HealthCheckResult,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Liveness probe at `/api/health`: DB-independent. Reports the process is
   * alive and responds quickly even when the database is unreachable, so a
   * transient DB outage never triggers a pod restart.
   */
  @Get()
  check(): { status: string; info: Record<string, { status: string }> } {
    return { status: 'ok', info: { process: { status: 'up' } } };
  }

  /** Readiness probe at `/api/health/deep`: DB-dependent (pings PostgreSQL). */
  @Get('deep')
  @HealthCheck()
  deep(): Promise<HealthCheckResult> {
    return this.health.check([() => this.pingDatabase()]);
  }

  /** Verifies the live PostgreSQL connection with a trivial query. */
  private async pingDatabase(): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { database: { status: 'up' } };
    } catch (err) {
      throw new HealthCheckError('Database unreachable', {
        database: {
          status: 'down',
          message: err instanceof Error ? err.message : 'unknown error',
        },
      });
    }
  }
}

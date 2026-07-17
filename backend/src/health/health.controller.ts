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

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([() => this.pingDatabase()]);
  }

  /** Deep probe: same DB ping, exposed at `/api/health/deep`. */
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

import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  /**
   * Attempt to connect on boot, but never crash the process if the database is
   * unreachable. The app stays up so `/api/health` keeps returning 200 and
   * `/api/health/deep` can correctly report 503 until the DB comes back.
   * A background retry loop reconnects with capped exponential backoff.
   */
  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Connected to the database');
    } catch (error) {
      this.logger.error(
        `Initial database connection failed; continuing in degraded mode: ${
          (error as Error)?.message ?? error
        }`,
      );
      void this.retryConnect();
    }
  }

  private async retryConnect(attempt = 1): Promise<void> {
    const maxDelayMs = 30_000;
    const delayMs = Math.min(1_000 * 2 ** (attempt - 1), maxDelayMs);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    try {
      await this.$connect();
      this.logger.log(
        `Connected to the database after ${attempt} retr${
          attempt === 1 ? 'y' : 'ies'
        }`,
      );
    } catch (error) {
      this.logger.warn(
        `Database reconnect attempt ${attempt} failed: ${
          (error as Error)?.message ?? error
        }`,
      );
      void this.retryConnect(attempt + 1);
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.$disconnect();
    } catch {
      // ignore disconnect errors on shutdown
    }
  }
}

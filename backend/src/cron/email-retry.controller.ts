import { Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EmailService } from '../email/email.service';
import { CronSecretGuard } from './cron-secret.guard';

@ApiTags('cron')
@Controller('cron')
export class EmailRetryController {
  constructor(private readonly email: EmailService) {}

  @Post('email-retry')
  @HttpCode(HttpStatus.OK)
  @UseGuards(CronSecretGuard)
  @ApiOperation({ summary: 'Drain the email outbox (secret-guarded, for scheduler)' })
  async retry() {
    return this.email.drainOutbox();
  }
}

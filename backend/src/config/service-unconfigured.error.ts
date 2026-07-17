import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Thrown when an integration credential is missing or still set to the
 * placeholder value. Surfaces as HTTP 503 so the frontend can render a
 * "not yet configured" state instead of a hard crash.
 */
export class ServiceUnconfiguredError extends HttpException {
  constructor(service: string) {
    super(
      {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        error: 'Service Unconfigured',
        message: `${service} is not configured. Set its credentials in Admin → Settings.`,
        service,
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { deepSanitize } from './sanitize.util';

/**
 * Global pipe that strips HTML from every string in request bodies before the
 * data reaches controllers/services. Runs on `body` only — query/param values
 * used for filtering are validated separately and are not persisted as content.
 */
@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (metadata.type !== 'body' || value == null) return value;
    return deepSanitize(value);
  }
}

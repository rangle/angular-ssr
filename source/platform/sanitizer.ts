import {
  Injectable,
  Sanitizer,
  SecurityContext,
} from '@angular/core/index';

@Injectable()
export class SanitizerImpl implements Sanitizer {
  sanitize = (context: SecurityContext, value: string) => value;
}
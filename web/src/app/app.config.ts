import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { credentialsInterceptor } from './core/credentials.interceptor';

/**
 * Root application config.
 *
 * The frontend talks to the NestJS REST API under `/api` (same origin, proxied
 * by nginx in production). The credentials interceptor attaches the httpOnly
 * admin session cookie so guarded admin routes authenticate transparently.
 * `withComponentInputBinding` lets route params (`:slug`, `:token`, `?page=`)
 * bind straight to component inputs for the deep-linkable states in the plan.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([credentialsInterceptor])),
    provideAnimations(),
  ],
};

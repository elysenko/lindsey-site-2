export declare const RATE_LIMIT_KEY = "rate_limit_options";
export interface RateLimitOptions {
    action: string;
    limit: number;
    windowMinutes: number;
}
export declare const RateLimit: (options: RateLimitOptions) => import("@nestjs/common").CustomDecorator<string>;

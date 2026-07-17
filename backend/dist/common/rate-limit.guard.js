"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("../prisma/prisma.service");
const rate_limit_decorator_1 = require("./rate-limit.decorator");
const client_ip_util_1 = require("./client-ip.util");
let RateLimitGuard = class RateLimitGuard {
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const options = this.reflector.getAllAndOverride(rate_limit_decorator_1.RATE_LIMIT_KEY, [context.getHandler(), context.getClass()]);
        if (!options)
            return true;
        const req = context.switchToHttp().getRequest();
        const key = (0, client_ip_util_1.getClientIp)(req);
        const since = new Date(Date.now() - options.windowMinutes * 60_000);
        const count = await this.prisma.rateLimitHit.count({
            where: { key, action: options.action, createdAt: { gte: since } },
        });
        if (count >= options.limit) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.TOO_MANY_REQUESTS,
                error: 'Too Many Requests',
                message: `Rate limit exceeded. Please try again later.`,
            }, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        await this.prisma.rateLimitHit.create({
            data: { key, action: options.action },
        });
        return true;
    }
};
exports.RateLimitGuard = RateLimitGuard;
exports.RateLimitGuard = RateLimitGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService])
], RateLimitGuard);
//# sourceMappingURL=rate-limit.guard.js.map
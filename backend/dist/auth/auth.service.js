"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const LOCKOUT_THRESHOLD = 10;
const LOCKOUT_WINDOW_MIN = 15;
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwt, email) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.email = email;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async hashPassword(plain) {
        return bcrypt.hash(plain, 12);
    }
    async verifyPassword(plain, hash) {
        return bcrypt.compare(plain, hash);
    }
    signSession(payload) {
        return this.jwt.sign(payload);
    }
    verifySession(token) {
        return this.jwt.verify(token);
    }
    async recentFailures(email) {
        const since = new Date(Date.now() - LOCKOUT_WINDOW_MIN * 60_000);
        return this.prisma.loginAttempt.count({
            where: { email, success: false, createdAt: { gte: since } },
        });
    }
    async login(email, password, ip) {
        const normalizedEmail = email.trim().toLowerCase();
        const failures = await this.recentFailures(normalizedEmail);
        if (failures >= LOCKOUT_THRESHOLD) {
            await this.dispatchResetEmail(normalizedEmail);
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.TOO_MANY_REQUESTS,
                error: 'Too Many Requests',
                message: 'Too many failed attempts. This account is temporarily locked; check your email for a reset link.',
            }, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        const user = await this.prisma.user.findUnique({
            where: { email: normalizedEmail },
        });
        const passwordOk = !!user?.password &&
            (await this.verifyPassword(password, user.password));
        if (!user || !passwordOk || user.role !== 'ADMIN') {
            await this.prisma.loginAttempt.create({
                data: { email: normalizedEmail, ip, success: false },
            });
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        await this.prisma.loginAttempt.create({
            data: { email: normalizedEmail, ip, success: true },
        });
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        return { token: this.signSession(payload), user: payload };
    }
    async dispatchResetEmail(email) {
        try {
            const user = await this.prisma.user.findUnique({ where: { email } });
            if (!user)
                return;
            await this.email.enqueue({
                to: email,
                subject: 'LeBarre Group — account temporarily locked',
                body: 'Your admin account was temporarily locked after multiple failed sign-in attempts. ' +
                    'If this was not you, no action is required — the lock lifts automatically in 15 minutes. ' +
                    'To reset your password, contact your administrator.',
            }, 'lockout reset dispatch');
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            this.logger.warn(`Reset email dispatch failed: ${message}`);
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
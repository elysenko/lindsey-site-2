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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsultationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const consultation_service_1 = require("./consultation.service");
const create_consultation_dto_1 = require("./dto/create-consultation.dto");
const rate_limit_decorator_1 = require("../common/rate-limit.decorator");
const rate_limit_guard_1 = require("../common/rate-limit.guard");
const client_ip_util_1 = require("../common/client-ip.util");
let ConsultationController = class ConsultationController {
    constructor(consultation) {
        this.consultation = consultation;
    }
    async create(dto, req) {
        return this.consultation.create(dto, (0, client_ip_util_1.getClientIp)(req));
    }
};
exports.ConsultationController = ConsultationController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseGuards)(rate_limit_guard_1.RateLimitGuard),
    (0, rate_limit_decorator_1.RateLimit)({ action: 'consultation', limit: 5, windowMinutes: 60 }),
    (0, swagger_1.ApiOperation)({
        summary: 'Submit a consultation request (rate-limited 5/60min/IP). Returns a brief token.',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_consultation_dto_1.CreateConsultationDto, Object]),
    __metadata("design:returntype", Promise)
], ConsultationController.prototype, "create", null);
exports.ConsultationController = ConsultationController = __decorate([
    (0, swagger_1.ApiTags)('consultation'),
    (0, common_1.Controller)('consultation'),
    __metadata("design:paramtypes", [consultation_service_1.ConsultationService])
], ConsultationController);
//# sourceMappingURL=consultation.controller.js.map
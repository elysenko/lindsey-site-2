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
exports.AdminInsightsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const insights_service_1 = require("./insights.service");
const insights_dto_1 = require("./dto/insights.dto");
const admin_guard_1 = require("../auth/admin.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let AdminInsightsController = class AdminInsightsController {
    constructor(insights) {
        this.insights = insights;
    }
    list() {
        return this.insights.adminList();
    }
    get(id) {
        return this.insights.adminGet(id);
    }
    create(dto, user) {
        return this.insights.create(dto, user.userId);
    }
    update(id, dto) {
        return this.insights.update(id, dto);
    }
};
exports.AdminInsightsController = AdminInsightsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all insights (draft + published)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminInsightsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get an insight by id for editing' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminInsightsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create an insight (≥1500 words required to publish)',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [insights_dto_1.CreateInsightDto, Object]),
    __metadata("design:returntype", void 0)
], AdminInsightsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update an insight; publishing enforces ≥1500 words',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, insights_dto_1.UpdateInsightDto]),
    __metadata("design:returntype", void 0)
], AdminInsightsController.prototype, "update", null);
exports.AdminInsightsController = AdminInsightsController = __decorate([
    (0, swagger_1.ApiTags)('admin-insights'),
    (0, swagger_1.ApiCookieAuth)(),
    (0, common_1.Controller)('admin/insights'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __metadata("design:paramtypes", [insights_service_1.InsightsService])
], AdminInsightsController);
//# sourceMappingURL=admin-insights.controller.js.map
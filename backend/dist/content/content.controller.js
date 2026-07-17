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
exports.ContentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const services_data_1 = require("./services.data");
const faqs_data_1 = require("./faqs.data");
let ContentController = class ContentController {
    services() {
        return services_data_1.SERVICES;
    }
    service(slug) {
        const service = (0, services_data_1.findService)(slug);
        if (!service)
            throw new common_1.NotFoundException('Service not found');
        return { ...service, faqs: (0, faqs_data_1.faqsForService)(slug) };
    }
    faqs(category) {
        if (category) {
            return faqs_data_1.FAQS.filter((f) => f.category.toLowerCase() === category.toLowerCase());
        }
        return faqs_data_1.FAQS;
    }
};
exports.ContentController = ContentController;
__decorate([
    (0, common_1.Get)('services'),
    (0, swagger_1.ApiOperation)({ summary: 'List all service offerings' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "services", null);
__decorate([
    (0, common_1.Get)('services/:slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Service detail with its embedded FAQs' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "service", null);
__decorate([
    (0, common_1.Get)('faqs'),
    (0, swagger_1.ApiOperation)({ summary: 'List FAQs, optionally filtered by category' }),
    __param(0, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "faqs", null);
exports.ContentController = ContentController = __decorate([
    (0, swagger_1.ApiTags)('content'),
    (0, common_1.Controller)()
], ContentController);
//# sourceMappingURL=content.controller.js.map
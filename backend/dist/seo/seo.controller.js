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
exports.SeoController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const seo_service_1 = require("./seo.service");
let SeoController = class SeoController {
    constructor(seo) {
        this.seo = seo;
    }
    origin(req) {
        const configured = process.env.SITE_URL?.trim();
        if (configured)
            return configured.replace(/\/+$/, '');
        const proto = req.headers['x-forwarded-proto']?.split(',')[0]?.trim() ||
            req.protocol ||
            'https';
        const host = req.headers['x-forwarded-host']?.split(',')[0]?.trim() ||
            req.headers.host ||
            'localhost';
        return `${proto}://${host}`;
    }
    async sitemap(req) {
        return this.seo.buildSitemap(this.origin(req));
    }
    robots(req) {
        return this.seo.buildRobots(this.origin(req));
    }
};
exports.SeoController = SeoController;
__decorate([
    (0, common_1.Get)('sitemap.xml'),
    (0, common_1.Header)('Content-Type', 'application/xml; charset=utf-8'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "sitemap", null);
__decorate([
    (0, common_1.Get)('robots.txt'),
    (0, common_1.Header)('Content-Type', 'text/plain; charset=utf-8'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", String)
], SeoController.prototype, "robots", null);
exports.SeoController = SeoController = __decorate([
    (0, swagger_1.ApiExcludeController)(),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [seo_service_1.SeoService])
], SeoController);
//# sourceMappingURL=seo.controller.js.map
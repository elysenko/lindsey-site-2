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
exports.ListLeadsDto = exports.LeadSort = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
var LeadSort;
(function (LeadSort) {
    LeadSort["NEWEST"] = "newest";
    LeadSort["OLDEST"] = "oldest";
})(LeadSort || (exports.LeadSort = LeadSort = {}));
class ListLeadsDto {
    constructor() {
        this.sort = LeadSort.NEWEST;
        this.page = 1;
        this.pageSize = 20;
    }
}
exports.ListLeadsDto = ListLeadsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListLeadsDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by challenge category' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListLeadsDto.prototype, "challenge", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: LeadSort, default: LeadSort.NEWEST }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(LeadSort),
    __metadata("design:type", String)
], ListLeadsDto.prototype, "sort", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ListLeadsDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 20, maximum: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], ListLeadsDto.prototype, "pageSize", void 0);
//# sourceMappingURL=list-leads.dto.js.map
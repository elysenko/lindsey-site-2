"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceUnconfiguredError = void 0;
const common_1 = require("@nestjs/common");
class ServiceUnconfiguredError extends common_1.HttpException {
    constructor(service) {
        super({
            statusCode: common_1.HttpStatus.SERVICE_UNAVAILABLE,
            error: 'Service Unconfigured',
            message: `${service} is not configured. Set its credentials in Admin → Settings.`,
            service,
        }, common_1.HttpStatus.SERVICE_UNAVAILABLE);
    }
}
exports.ServiceUnconfiguredError = ServiceUnconfiguredError;
//# sourceMappingURL=service-unconfigured.error.js.map
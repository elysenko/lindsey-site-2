"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientIp = getClientIp;
function getClientIp(req) {
    const xff = req.headers['x-forwarded-for'];
    if (typeof xff === 'string' && xff.length > 0) {
        return xff.split(',')[0].trim();
    }
    if (Array.isArray(xff) && xff.length > 0) {
        return xff[0].split(',')[0].trim();
    }
    return req.ip || req.socket?.remoteAddress || 'unknown';
}
//# sourceMappingURL=client-ip.util.js.map
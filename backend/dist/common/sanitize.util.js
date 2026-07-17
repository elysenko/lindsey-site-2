"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripHtml = stripHtml;
exports.deepSanitize = deepSanitize;
const sanitize_html_1 = __importDefault(require("sanitize-html"));
function stripHtml(value) {
    return (0, sanitize_html_1.default)(value, {
        allowedTags: [],
        allowedAttributes: {},
        disallowedTagsMode: 'discard',
    }).trim();
}
function deepSanitize(value) {
    if (typeof value === 'string') {
        return stripHtml(value);
    }
    if (Array.isArray(value)) {
        return value.map((v) => deepSanitize(v));
    }
    if (value && typeof value === 'object') {
        const out = {};
        for (const [k, v] of Object.entries(value)) {
            out[k] = deepSanitize(v);
        }
        return out;
    }
    return value;
}
//# sourceMappingURL=sanitize.util.js.map
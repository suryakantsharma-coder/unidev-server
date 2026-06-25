"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPENAI_MAX_TOKENS = exports.OPENAI_TEMPERATURE = exports.OPENAI_MODEL = exports.openai = void 0;
const openai_1 = __importDefault(require("openai"));
const env_1 = require("./env");
if (!env_1.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not defined in environment');
}
exports.openai = new openai_1.default({
    apiKey: env_1.env.OPENAI_API_KEY,
});
exports.OPENAI_MODEL = 'gpt-4o-mini';
exports.OPENAI_TEMPERATURE = 0.4;
exports.OPENAI_MAX_TOKENS = 1024;
//# sourceMappingURL=openai.js.map
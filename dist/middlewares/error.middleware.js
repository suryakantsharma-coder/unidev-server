"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
exports.notFoundMiddleware = notFoundMiddleware;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../config/env");
function getStatusCode(err) {
    if (err.statusCode && err.statusCode >= 400 && err.statusCode < 600) {
        return err.statusCode;
    }
    if (err.name === 'ValidationError')
        return 400;
    if (err instanceof mongoose_1.default.Error.ValidationError)
        return 400;
    if (err instanceof mongoose_1.default.Error.CastError)
        return 400;
    if (err.name === 'MongoServerError')
        return 500;
    const status = err.status;
    if (typeof status === 'number' && status >= 400 && status < 600)
        return status;
    return 500;
}
function getMessage(err) {
    if (env_1.env.isProduction && (err.statusCode ?? 500) >= 500) {
        return 'Internal server error';
    }
    return err.message || 'An unexpected error occurred';
}
function errorMiddleware(err, _req, res, _next) {
    const statusCode = getStatusCode(err);
    const message = getMessage(err);
    res.status(statusCode).json({ success: false, message });
}
function notFoundMiddleware(_req, res) {
    res.status(404).json({ success: false, message: 'Not found' });
}
//# sourceMappingURL=error.middleware.js.map
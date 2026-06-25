"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappRoutes = exports.shutdownWhatsAppClient = exports.getWhatsAppClient = exports.isWhatsAppReady = exports.requestWhatsAppLogin = void 0;
var whatsapp_client_1 = require("./whatsapp.client");
Object.defineProperty(exports, "requestWhatsAppLogin", { enumerable: true, get: function () { return whatsapp_client_1.requestWhatsAppLogin; } });
Object.defineProperty(exports, "isWhatsAppReady", { enumerable: true, get: function () { return whatsapp_client_1.isWhatsAppReady; } });
Object.defineProperty(exports, "getWhatsAppClient", { enumerable: true, get: function () { return whatsapp_client_1.getWhatsAppClient; } });
Object.defineProperty(exports, "shutdownWhatsAppClient", { enumerable: true, get: function () { return whatsapp_client_1.shutdownWhatsAppClient; } });
var whatsapp_routes_1 = require("./whatsapp.routes");
Object.defineProperty(exports, "whatsappRoutes", { enumerable: true, get: function () { return __importDefault(whatsapp_routes_1).default; } });
//# sourceMappingURL=index.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDb = connectDb;
exports.disconnectDb = disconnectDb;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
async function connectDb() {
    if (!env_1.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in environment');
    }
    await mongoose_1.default.connect(env_1.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
    });
}
async function disconnectDb() {
    await mongoose_1.default.disconnect();
}
//# sourceMappingURL=db.js.map
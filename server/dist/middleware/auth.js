"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const appError_1 = require("../utils/appError");
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new appError_1.AppError(401, 'No access token provided'));
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return next(new appError_1.AppError(401, 'No access token provided'));
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET);
        req.user = { userId: payload.userId, role: payload.role };
        next();
    }
    catch (err) {
        return next(new appError_1.AppError(401, 'Invalid or expired access token'));
    }
}
//# sourceMappingURL=auth.js.map
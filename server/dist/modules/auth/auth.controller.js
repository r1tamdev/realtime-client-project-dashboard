"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginHandler = loginHandler;
exports.refreshHandler = refreshHandler;
exports.logoutHandler = logoutHandler;
exports.meHandler = meHandler;
const auth_service_1 = require("./auth.service");
const appError_1 = require("../../utils/appError");
const db_1 = __importDefault(require("../../config/db"));
const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    path: '/api/auth',
};
async function loginHandler(req, res, next) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new appError_1.AppError(400, 'Email and password are required');
        }
        const { accessToken, refreshToken, user } = await (0, auth_service_1.login)(email, password);
        res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions);
        res.status(200).json({ accessToken, user });
    }
    catch (err) {
        next(err);
    }
}
async function refreshHandler(req, res, next) {
    try {
        const rawRefreshToken = req.cookies[REFRESH_COOKIE_NAME];
        if (!rawRefreshToken) {
            throw new appError_1.AppError(401, 'No refresh token provided');
        }
        const { accessToken, refreshToken } = await (0, auth_service_1.refreshAccessToken)(rawRefreshToken);
        res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions);
        res.status(200).json({ accessToken });
    }
    catch (err) {
        next(err);
    }
}
async function logoutHandler(req, res, next) {
    try {
        const rawRefreshToken = req.cookies[REFRESH_COOKIE_NAME];
        if (rawRefreshToken) {
            await (0, auth_service_1.logout)(rawRefreshToken);
        }
        res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
        res.status(200).json({ message: 'Logged out successfully' });
    }
    catch (err) {
        next(err);
    }
}
async function meHandler(req, res, next) {
    try {
        const user = await db_1.default.user.findUnique({
            where: { id: req.user.userId },
            select: { id: true, name: true, email: true, role: true },
        });
        res.status(200).json(user);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=auth.controller.js.map
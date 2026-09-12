"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.refreshAccessToken = refreshAccessToken;
exports.logout = logout;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const db_1 = __importDefault(require("../../config/db"));
const env_1 = require("../../config/env");
const appError_1 = require("../../utils/appError");
const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
function signAccessToken(userId, role) {
    return jsonwebtoken_1.default.sign({ userId, role }, env_1.env.JWT_ACCESS_SECRET, {
        expiresIn: ACCESS_TOKEN_TTL,
    });
}
function hashToken(token) {
    // fast, deterministic hash — fine for opaque random tokens (unlike passwords, no need for bcrypt's slow salt)
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
}
async function issueRefreshToken(userId) {
    const rawToken = crypto_1.default.randomBytes(64).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
    await db_1.default.refreshToken.create({
        data: { userId, tokenHash, expiresAt },
    });
    return rawToken; // this raw value is what goes in the cookie; only the hash is stored
}
async function login(email, password) {
    const user = await db_1.default.user.findUnique({ where: { email } });
    if (!user) {
        throw new appError_1.AppError(401, 'Invalid email or password');
    }
    const passwordMatches = await bcrypt_1.default.compare(password, user.passwordHash);
    if (!passwordMatches) {
        throw new appError_1.AppError(401, 'Invalid email or password');
    }
    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = await issueRefreshToken(user.id);
    return {
        accessToken,
        refreshToken,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
}
async function refreshAccessToken(rawRefreshToken) {
    const tokenHash = hashToken(rawRefreshToken);
    const storedToken = await db_1.default.refreshToken.findFirst({
        where: { tokenHash, revoked: false },
        include: { user: true },
    });
    if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new appError_1.AppError(401, 'Refresh token invalid or expired');
    }
    // rotate: revoke the used token, issue a new one
    await db_1.default.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoked: true },
    });
    const newRefreshToken = await issueRefreshToken(storedToken.userId);
    const newAccessToken = signAccessToken(storedToken.userId, storedToken.user.role);
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}
async function logout(rawRefreshToken) {
    const tokenHash = hashToken(rawRefreshToken);
    await db_1.default.refreshToken.updateMany({
        where: { tokenHash },
        data: { revoked: true },
    });
}
//# sourceMappingURL=auth.service.js.map
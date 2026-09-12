"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'PORT',
    'CLIENT_URL',
];
function loadEnv() {
    const missing = [];
    const env = {};
    for (const key of requiredEnvVars) {
        const value = process.env[key];
        if (!value) {
            missing.push(key);
        }
        else {
            env[key] = value;
        }
    }
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    return env;
}
exports.env = loadEnv();
//# sourceMappingURL=env.js.map
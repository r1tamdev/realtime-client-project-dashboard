"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
const appError_1 = require("../utils/appError");
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return next(new appError_1.AppError(401, 'Not authenticated'));
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(new appError_1.AppError(403, 'Insufficient permissions for this action'));
        }
        next();
    };
}
//# sourceMappingURL=requireRole.js.map
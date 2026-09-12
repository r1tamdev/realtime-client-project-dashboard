"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const appError_1 = require("../utils/appError");
function errorHandler(err, _req, res, _next) {
    if (err instanceof appError_1.AppError) {
        return res.status(err.statusCode).json({
            error: {
                message: err.message,
                statusCode: err.statusCode,
            },
        });
    }
    console.error('[errorHandler]', err);
    return res.status(500).json({
        error: {
            message: 'Internal server error',
            statusCode: 500,
        },
    });
}
//# sourceMappingURL=errorHandler.js.map
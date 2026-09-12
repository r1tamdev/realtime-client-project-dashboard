"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRequiredParam = getRequiredParam;
const appError_1 = require("./appError");
function getRequiredParam(params, key) {
    const value = params[key];
    if (!value || Array.isArray(value)) {
        throw new appError_1.AppError(400, `Missing or invalid parameter: ${key}`);
    }
    return value;
}
//# sourceMappingURL=getRequiredParam.js.map
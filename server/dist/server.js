"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const index_1 = require("./sockets/index");
const overdueTaskChecker_1 = require("./jobs/overdueTaskChecker");
const server = http_1.default.createServer(app_1.default);
(0, index_1.initSocketServer)(server);
(0, overdueTaskChecker_1.startOverdueTaskScheduler)();
server.listen(env_1.env.PORT, () => {
    console.log(`Server running on port ${env_1.env.PORT}`);
});
//# sourceMappingURL=server.js.map
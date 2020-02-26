"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const inversify_config_1 = require("./inversify.config");
const types_1 = require("./types");
const bot = inversify_config_1.default.get(types_1.TYPES.Bot);
const GatewayConnectionLogger = inversify_config_1.default.get(types_1.TYPES.GatewayConnectionLogger);
bot.listen().then(() => {
    GatewayConnectionLogger.info(() => 'Para.bot Connected');
}).catch((error) => {
    GatewayConnectionLogger.info(() => 'Para.bot cannot connect, reason: ', error);
});
//# sourceMappingURL=index.js.map
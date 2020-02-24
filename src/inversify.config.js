"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const inversify_1 = require("inversify");
const types_1 = require("./types");
const bot_1 = require("./bot");
const discord_js_1 = require("discord.js");
const log_config_1 = require("./log.config");
let container = new inversify_1.Container();
container.bind(types_1.TYPES.Bot).to(bot_1.Bot).inSingletonScope();
container.bind(types_1.TYPES.Client).toConstantValue(new discord_js_1.Client());
container.bind(types_1.TYPES.Token).toConstantValue(process.env.TOKEN);
container.bind(types_1.TYPES.GatewayMessageLogger).toConstantValue(log_config_1.factory.getLogger("Gateway.MessageRecieved"));
container.bind(types_1.TYPES.GatewayConnectionLogger).toConstantValue(log_config_1.factory.getLogger("GatewayConnection"));
exports.default = container;
//# sourceMappingURL=inversify.config.js.map
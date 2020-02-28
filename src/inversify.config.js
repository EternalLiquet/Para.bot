"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const inversify_1 = require("inversify");
const types_1 = require("./types");
const bot_1 = require("./bot");
const discord_js_1 = require("discord.js");
const log_config_1 = require("./log.config");
const dbclient_1 = require("./dbclient");
const level_handler_1 = require("./services/level-handler");
const check_level_1 = require("./services/check-level");
let container = new inversify_1.Container();
container.bind(types_1.TYPES.Bot).to(bot_1.Bot).inSingletonScope();
container.bind(types_1.TYPES.Client).toConstantValue(new discord_js_1.Client());
container.bind(types_1.TYPES.Token).toConstantValue(process.env.TOKEN);
container.bind(types_1.TYPES.DbConnectionString).toConstantValue(process.env.DBCONNECTIONSTRING);
container.bind(types_1.TYPES.GatewayMessageLogger).toConstantValue(log_config_1.factory.getLogger("Gateway.MessageRecieved"));
container.bind(types_1.TYPES.GatewayConnectionLogger).toConstantValue(log_config_1.factory.getLogger("GatewayConnection"));
container.bind(types_1.TYPES.DatabaseConnectionLogger).toConstantValue(log_config_1.factory.getLogger("DatabaseConnection"));
container.bind(types_1.TYPES.LevelHandlerLogger).toConstantValue(log_config_1.factory.getLogger("Service.LevelHandler"));
container.bind(types_1.TYPES.DbClient).to(dbclient_1.DbClient).inSingletonScope();
container.bind(types_1.TYPES.LevelHandler).to(level_handler_1.LevelHandler).inSingletonScope();
container.bind(types_1.TYPES.LevelChecker).to(check_level_1.LevelCheck).inSingletonScope();
exports.default = container;
//# sourceMappingURL=inversify.config.js.map
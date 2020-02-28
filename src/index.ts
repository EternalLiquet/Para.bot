require('dotenv').config();
import container from "./inversify.config";
import { TYPES } from "./types";
import { Bot } from "./bot";
import { Logger } from "typescript-logging";
import { DbClient } from "./dbclient";

const bot = container.get<Bot>(TYPES.Bot);
const mongoDbClient = container.get<DbClient>(TYPES.DbClient);
const GatewayConnectionLogger = container.get<Logger>(TYPES.GatewayConnectionLogger);

bot.listen().then(() => {
  GatewayConnectionLogger.info(() => 'Para.bot Connected')
}).catch((error) => {
  GatewayConnectionLogger.info(() => 'Para.bot cannot connect, reason: ', error)
});

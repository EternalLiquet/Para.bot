require('dotenv').config();
import container from "./inversify.config";
import { TYPES } from "./types";
import { Bot } from "./bot";
import { Logger } from "typescript-logging";
import { inject } from "inversify";
let bot = container.get<Bot>(TYPES.Bot);
const GatewayConnectionLogger = container.get<Logger>(TYPES.GatewayConnectionLogger);

bot.listen().then(() => {
  GatewayConnectionLogger.info(() => 'Para.bot Connected')
}).catch((error) => {
  GatewayConnectionLogger.info(() => 'Para.bot cannot connect, reason: ', error)
});
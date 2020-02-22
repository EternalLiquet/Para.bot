require('dotenv').config();
import container from "./inversify.config";
import { TYPES } from "./types";
import { Bot } from "./bot";
let bot = container.get<Bot>(TYPES.Bot);
bot.listen().then(() => {
  console.info('Para.bot Connected')
}).catch((error) => {
  console.info('Para.bot cannot connect, reason: ', error)
});
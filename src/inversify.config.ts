import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "./types";
import { Bot } from "./bot";
import { Client } from "discord.js";
import { Logger } from "typescript-logging";
import { factory } from "./log.config"

let container = new Container();

container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<Client>(TYPES.Client).toConstantValue(new Client());
container.bind<string>(TYPES.Token).toConstantValue(process.env.TOKEN);
container.bind<Logger>(TYPES.GatewayMessageLogger).toConstantValue(factory.getLogger("Gateway.MessageRecieved"));
container.bind<Logger>(TYPES.GatewayConnectionLogger).toConstantValue(factory.getLogger("GatewayConnection"))

export default container;
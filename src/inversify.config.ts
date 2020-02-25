import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "./types";
import { Bot } from "./bot";
import { Client } from "discord.js";
import { Logger } from "typescript-logging";
import { factory } from "./log.config";
import { DbClient } from "./dbclient";
import { LevelHandler } from "./services/level-handler"

let container = new Container();

container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<Client>(TYPES.Client).toConstantValue(new Client());
container.bind<string>(TYPES.Token).toConstantValue(process.env.TOKEN);
container.bind<string>(TYPES.DbConnectionString).toConstantValue(process.env.DBCONNECTIONSTRING)
container.bind<Logger>(TYPES.GatewayMessageLogger).toConstantValue(factory.getLogger("Gateway.MessageRecieved"));
container.bind<Logger>(TYPES.GatewayConnectionLogger).toConstantValue(factory.getLogger("GatewayConnection"));
container.bind<Logger>(TYPES.DatabaseConnectionLogger).toConstantValue(factory.getLogger("DatabaseConnection"))
container.bind<DbClient>(TYPES.DbClient).to(DbClient).inSingletonScope();
container.bind<LevelHandler>(TYPES.LevelHandler).to(LevelHandler).inSingletonScope();

export default container;
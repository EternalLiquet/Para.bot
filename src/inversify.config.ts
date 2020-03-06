import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "./types";
import { Bot } from "./bot";
import { Client } from "discord.js";
import { Logger } from "typescript-logging";
import { factory } from "./log.config";
import { DbClient } from "./dbclient";
import { LevelHandler } from "./services/level-handler";
import { LevelCheck } from "./services/check-level";
import { NewMemberHandler } from "./services/new-member-handler";
import { AdministratorModule } from "./services/command-handler/modules/administrative-module";
import { CommandHandler } from "./services/command-handler/command-handler";

let container = new Container();

container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<Client>(TYPES.Client).toConstantValue(new Client());
container.bind<string>(TYPES.Token).toConstantValue(process.env.TOKEN);
container.bind<string>(TYPES.DbConnectionString).toConstantValue(process.env.DBCONNECTIONSTRING)
container.bind<Logger>(TYPES.GatewayMessageLogger).toConstantValue(factory.getLogger("Gateway.MessageRecieved"));
container.bind<Logger>(TYPES.GatewayConnectionLogger).toConstantValue(factory.getLogger("GatewayConnection"));
container.bind<Logger>(TYPES.DatabaseConnectionLogger).toConstantValue(factory.getLogger("DatabaseConnection"));
container.bind<Logger>(TYPES.LevelHandlerLogger).toConstantValue(factory.getLogger("Service.LevelHandler"));
container.bind<DbClient>(TYPES.DbClient).to(DbClient).inSingletonScope();
container.bind<LevelHandler>(TYPES.LevelHandler).to(LevelHandler).inSingletonScope();
container.bind<LevelCheck>(TYPES.LevelChecker).to(LevelCheck).inSingletonScope();
container.bind<NewMemberHandler>(TYPES.NewMemberHandler).to(NewMemberHandler).inSingletonScope();
container.bind<CommandHandler>(TYPES.CommandHandler).to(CommandHandler).inSingletonScope();

export default container;
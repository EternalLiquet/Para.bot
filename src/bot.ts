import { Client, Message } from "discord.js";
import { inject, injectable } from "inversify";
import { TYPES } from "./types";
import { factory } from "./log.config";
import { LoggerFactory, Logger } from "typescript-logging";
import { DbClient } from "./dbclient";
import { LevelHandler } from "./services/level-handler";
import { ParabotLevel } from "./entities/parabot-levels";
import { Repository } from "mongodb-typescript";
import container from "./inversify.config";
import { LevelCheck } from "./services/check-level";

@injectable()
export class Bot {
  private client: Client;
  private readonly token: string;
  private GatewayMessageLogger: Logger;
  private DatabaseConnectionLogger: Logger;
  private levelHandler: LevelHandler;
  private levelChecker: LevelCheck;

  constructor(
    @inject(TYPES.Client) client: Client,
    @inject(TYPES.Token) token: string,
    @inject(TYPES.GatewayMessageLogger) GatewayMessageLogger: Logger,
    @inject(TYPES.DatabaseConnectionLogger) DatabaseConnectionLogger: Logger,
    @inject(TYPES.LevelHandler) levelHandler: LevelHandler,
    @inject(TYPES.LevelChecker) levelChecker: LevelCheck
  ) {
    this.client = client;
    this.token = token;
    this.GatewayMessageLogger = GatewayMessageLogger;
    this.DatabaseConnectionLogger = DatabaseConnectionLogger;
    this.levelHandler = levelHandler;
    this.levelChecker = levelChecker;
  }

  public listen(): Promise<string> {
    this.client.once('ready', async () => {
      const mongoClient = container.get<DbClient>(TYPES.DbClient);
      await mongoClient.connect();
      var levelRepo = new Repository<ParabotLevel>(ParabotLevel, mongoClient.db, "levels");
      this.ensure_exp_requirements_collection_exists(levelRepo).then((result) => {
        this.DatabaseConnectionLogger.info(result);
      });
    });

    this.client.on('ready', () => {
      this.client.user.setActivity("Para.bot is under development, please check back later.", { url: "https://github.com/EternalLiquet/Para.bot" });
    });

    this.client.on('message', (message: Message) => {
      if (message.author.bot) return;
      this.GatewayMessageLogger.debug(`User: ${message.author.username}\tServer: ${message.guild != null ? message.guild.name : "In DM Channel"}\tMessageRecieved: ${message.content}\tTimestamp: ${message.createdTimestamp}`);
      if (message.guild != null) {
      /**
        this.levelHandler.handle(message).then((promise) => {
          this.GatewayMessageLogger.debug(`Promise handled: ${promise}`);
        }).catch((error) => {
          this.GatewayMessageLogger.error(error);
          process.exit();
        });
        this.levelChecker.handle(message).then(() => {
          this.GatewayMessageLogger.info(`Level info sent to ${message.author}`);
        }).catch((error) => {
          if(error != 'Message does not match command'){
            this.GatewayMessageLogger.error(`Failed to send level info to ${message.author} for reason: ${error}`);
          }
        });
      **/
      }
    });
    return this.client.login(this.token);
  }

  private async ensure_exp_requirements_collection_exists(levelRepo: Repository<ParabotLevel>): Promise<string> {
    await levelRepo.count().then((result) => {
      console.log('Count: ', result);
      if (result == null || result == 0) {
        this.create_exp_threshholds().forEach(async expThreshHold => {
          levelRepo.insert(expThreshHold);
        });
      }
    });
    return Promise.resolve("Levels database created");
  }
  private create_exp_threshholds(): ParabotLevel[] {
    var threshHolds = [2, 3, 5, 8, 15, 20, 25, 30, 35, 40, 50];
    var levelArray = [];
    var i = 1;
    threshHolds.forEach(threshHold => {
      levelArray.push(new ParabotLevel(i, threshHold));
      i++;
    });
    return levelArray;
  };
}
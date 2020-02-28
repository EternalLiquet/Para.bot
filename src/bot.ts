import { Client, Message } from "discord.js";
import { inject, injectable } from "inversify";
import { TYPES } from "./types";
import { factory } from "./log.config";
import { LoggerFactory, Logger } from "typescript-logging";
import { DbClient } from "./dbclient";
import { LevelHandler } from "./services/level-handler";
import { ParabotLevel } from "./entities/parabot-levels";
import { Repository } from "mongodb-typescript";

@injectable()
export class Bot {
  private client: Client;
  private readonly token: string;
  private GatewayMessageLogger: Logger;
  private dbClient: DbClient;
  private levelHandler: LevelHandler;

  constructor(
    @inject(TYPES.Client) client: Client,
    @inject(TYPES.Token) token: string,
    @inject(TYPES.GatewayMessageLogger) GatewayMessageLogger: Logger,
    @inject(TYPES.DbClient) dbClient: DbClient,
    @inject(TYPES.LevelHandler) levelHandler: LevelHandler
  ) {
    this.client = client;
    this.token = token;
    this.GatewayMessageLogger = GatewayMessageLogger;
    this.dbClient = dbClient;
    this.levelHandler = levelHandler;
  }

  public listen(): Promise<string> {
    this.client.once('ready', () => {

    });

    this.client.on('ready', () => {
      //this.client.user.setActivity("Para.bot is under development, please check back later.");
      console.log('bot ready event');
    });

    this.client.on('message', (message: Message) => {
      if (message.author.bot) return;
      this.GatewayMessageLogger.debug(`User: ${message.author.username}\tServer: ${message.guild != null ? message.guild.name : "In DM Channel"}\tMessageRecieved: ${message.content}\tTimestamp: ${message.createdTimestamp}`);
      if (message.guild != null) {
        this.levelHandler.handle(message).then((promise) => {
          this.GatewayMessageLogger.debug(`Promise handled: ${promise}`);
        });
      }
    });

    this.client.on('info', (info: String) => {

    });

    return this.client.login(this.token);
  }

  private async ensure_exp_requirements_collection_exists(levelRepo: Repository<ParabotLevel>): Promise<string> {
    levelRepo.count().then(async (result) => {
      console.log('Count: ', result);
      if (result == null || result == 0) {
        this.create_exp_threshholds().forEach(async expThreshHold => {
          await levelRepo.insert(expThreshHold);
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
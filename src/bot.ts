import { Client, Message, GuildMember, TextChannel, Collection, Emoji, MessageReaction, User } from "discord.js";
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
import { platform } from "os";
import { NewMemberHandler } from "./services/new-member-handler";
import { CommandHandler } from "./services/command-handler/command-handler";
import { ParabotSettings } from "./entities/parabot-settings";
import { NewMessageReactHandler } from "./services/new-message-react-handler";

@injectable()
export class Bot {
  private client: Client;
  private readonly token: string;
  private GatewayMessageLogger: Logger;
  private DatabaseConnectionLogger: Logger;
  private levelHandler: LevelHandler;
  private levelChecker: LevelCheck;
  private newMemberHandler: NewMemberHandler;
  private newMessageReactHandler: NewMessageReactHandler;
  private commandHandler: CommandHandler;
  private commandList: Collection<string, any>;
  private autoRoleMessageList: string[] = [];

  constructor(
    @inject(TYPES.Client) client: Client,
    @inject(TYPES.Token) token: string,
    @inject(TYPES.GatewayMessageLogger) GatewayMessageLogger: Logger,
    @inject(TYPES.DatabaseConnectionLogger) DatabaseConnectionLogger: Logger,
    @inject(TYPES.LevelHandler) levelHandler: LevelHandler,
    @inject(TYPES.LevelChecker) levelChecker: LevelCheck,
    @inject(TYPES.NewMemberHandler) newMemberHandler: NewMemberHandler,
    @inject(TYPES.NewMessageReactHandler) newMessageReactHandler: NewMessageReactHandler
  ) {
    this.client = client;
    this.token = token;
    this.GatewayMessageLogger = GatewayMessageLogger;
    this.DatabaseConnectionLogger = DatabaseConnectionLogger;
    this.levelHandler = levelHandler;
    this.levelChecker = levelChecker;
    this.newMemberHandler = newMemberHandler;
    this.newMessageReactHandler = newMessageReactHandler;
  }

  public listen(): Promise<string> {
    this.client.once('ready', async () => {
      const mongoClient = container.get<DbClient>(TYPES.DbClient);
      await mongoClient.connect();
      var levelRepo = new Repository<ParabotLevel>(ParabotLevel, mongoClient.db, "levels");
      this.ensure_exp_requirements_collection_exists(levelRepo).then((result) => {
        this.DatabaseConnectionLogger.info(result);
      });
      var settingsRepo = new Repository<ParabotSettings>(ParabotSettings, mongoClient.db, "settings");
      this.client.guilds.cache.forEach(async guild => {
        var autoRoleSetting = await settingsRepo.findById(`${guild.id}autorolesettings`);
        if (autoRoleSetting != undefined) {
          this.autoRoleMessageList.push(autoRoleSetting.Settings['messageToListen']);
        }
      });
      this.commandHandler = container.get<CommandHandler>(TYPES.CommandHandler);
      this.commandList = this.commandHandler.instantiateCommands();
      this.client.user.setActivity("Para.bot is under development, please check back later.", { url: "https://github.com/EternalLiquet/Para.bot", type: "PLAYING" });
    });

    this.client.on('guildMemberAdd', (member: GuildMember) => {
      if (member.user.bot) return;

      this.GatewayMessageLogger.debug(`User ${member.user.username} has joined server: ${member.guild.name}`);
      this.newMemberHandler.handle(member);
    });

    this.client.on('messageReactionAdd', async (messageReaction: MessageReaction, user: User) => {
      if (messageReaction.partial) {
        try {
          await messageReaction.fetch();
        } catch (error) {
          this.GatewayMessageLogger.error(`Something went wrong fetching message for reaction: ${error}`);
        }
      }
      this.GatewayMessageLogger.debug(`User: ${user.username} added a react: ${messageReaction.emoji.name} with ID of ${messageReaction.emoji.id} on message: ${messageReaction.message.content} with ID of ${messageReaction.message.id}`);
      this.newMessageReactHandler.handle(messageReaction, user);
    });

    this.client.on('message', (message: Message) => {
      if (message.author.bot) return;

      this.GatewayMessageLogger.debug(`User: ${message.author.username}\tServer: ${message.guild != null ? message.guild.name : "In DM Channel"}\tMessageRecieved: ${message.content}\tTimestamp: ${message.createdTimestamp}`);

      if (message.guild != null) {
        this.levelHandler.handle(message).then((promise) => {
          this.GatewayMessageLogger.debug(`Promise handled: ${promise}`);
        }).catch((error) => {
          this.GatewayMessageLogger.error(error);
          process.exit();
        });
      }

      var command = this.commandList.find(command => message.content.includes(`p.${command.name}`));
      if (command) {
        command.execute(message, message.content.substring((`p.${command.name}`).length, message.content.length).trim())
      }
    });

    this.client.on('error', async (error: Error) => {
      this.GatewayMessageLogger.error(`Para.Bot Error: ${error}`);
      var devUser = this.client.users.cache.find(user => user.id == process.env.DEVID);
      devUser.send(JSON.stringify(error));
    });

    return this.client.login(this.token);
  }

  private async ensure_exp_requirements_collection_exists(levelRepo: Repository<ParabotLevel>): Promise<string> {
    await levelRepo.count().then((result) => {
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

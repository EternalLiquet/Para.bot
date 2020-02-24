import { Client, Message } from "discord.js";
import { inject, injectable } from "inversify";
import { TYPES } from "./types";
import { factory }from "./log.config";
import { LoggerFactory, Logger } from "typescript-logging";
//import {MessageResponder} from "./services/message-responder";

@injectable()
export class Bot {
  private client: Client;
  private readonly token: string;
  private GatewayMessageLogger: Logger;

  constructor(
    @inject(TYPES.Client) client: Client,
    @inject(TYPES.Token) token: string,
    @inject(TYPES.GatewayMessageLogger) GatewayMessageLogger: Logger
  ) {
    this.client = client;
    this.token = token;
    this.GatewayMessageLogger = GatewayMessageLogger;
  }

  public listen(): Promise < string > {
    this.client.on('ready', () => {
        this.client.user.setActivity("Para.bot is under development, please check back later.");
    });

    this.client.on('message',(message: Message) => {
      if(message.author.bot) return;
      this.GatewayMessageLogger.info(`User: ${message.author.username}\t\t\t\tMessageRecieved: ${message.content}`);
    });
    
    return this.client.login(this.token);
  }
}
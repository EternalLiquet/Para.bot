import { Client, Message } from "discord.js";
import { inject, injectable } from "inversify";
import { TYPES } from "./types";
//import {MessageResponder} from "./services/message-responder";

@injectable()
export class Bot {
  private client: Client;
  private readonly token: string;

  constructor(
    @inject(TYPES.Client) client: Client,
    @inject(TYPES.Token) token: string
  ) {
    this.client = client;
    this.token = token;
  }

  public listen(): Promise < string > {
    this.client.on('ready', () => {
        this.client.user.setActivity("Para.bot is under development, please check back later.");
    });

    this.client.on('message',(message: Message) => {
      if(message.author.bot) return;
      
      console.info('User: ', message.author.username, '\t\t\tMessage recieved: ', message.content);
    });
    
    return this.client.login(this.token);
  }
}
import { Message } from 'discord.js';
import { ModuleBase } from '../../../entities/module-base';

export class AdministratorModule extends ModuleBase {

    name: string = 'greet settings';
    description: string = 'Will configure the bot greeting';
    help_text: string = `Use this in the channel you want your greeting to appear if you want it in a text channel. If you want it to be sent to a DM, set the channelOrDm setting to true. 
    When configuring the greeting message, use "p.username" to represent someone's username and p.servername to represent the name of the server they joined. 
    For example: If a user named John joined a server named Doe and the greeting message was set to: "Hello, p.username, welcome to p.servername", the bot would instead post: 
    "Hello, John, welcome to Doe"`;
    alias: string = null;

    async execute(message: Message, args: string) {
        await message.reply(`I've recieved your request to configure my settings`);
    }
}
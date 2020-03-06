import { Message, User, Guild, GuildMember, Collection } from 'discord.js';
import { ModuleBase } from '../../../entities/module-base';

export class AdministratorModule {
    public ModuleCommandList = [
        {
            name: 'greet setting', 
            description: 'Will configure the bot greeting',
            help_text:  `Use this in the channel you want your greeting to appear if you want it in a text channel. If you want it to be sent to a DM, set the channelOrDm setting to true. 
    When configuring the greeting message, use "p.username" to represent someone's username and p.servername to represent the name of the server they joined. 
    For example: If a user named John joined a server named Doe and the greeting message was set to: "Hello, p.username, welcome to p.servername", the bot would instead post: 
    "Hello, John, welcome to Doe"`,
            alias:  null,
            required_permission: 'ADMINISTRATOR',
            async execute(message: Message, args: string) {
                var guildUser = message.guild.members.cache.find(member => member.id == message.author.id);
                console.log('hewwo');
                console.log(this.required_permission);
                console.log(guildUser.hasPermission(this.required_permission))
                if(guildUser.hasPermission(this.required_permission)) {
                    console.log('wtf?');
                    await message.reply(`I've recieved your request to configure my settings`);
                }
            }
        }
    ];


}
import { Message, User, Guild, GuildMember, Collection } from 'discord.js';
import { Repository } from 'mongodb-typescript'
import { ModuleBase } from '../../../entities/module-base';
import container from '../../../inversify.config';
import { DbClient } from '../../../dbclient';
import { TYPES } from '../../../types';
import { ParabotSettings } from '../../../entities/parabot-settings';

export class AdministratorModule {
    public ModuleCommandList = [
        {
            name: 'greet setting',
            description: 'Will configure the bot greeting',
            help_text: `Use this in the channel you want your greeting to appear if you want it in a text channel. If you want it to be sent to a DM, set the channelOrDm setting to true. 
                When configuring the greeting message, use "p.username" to represent someone's username and p.servername to represent the name of the server they joined. 
                For example: If a user named John joined a server named Doe and the greeting message was set to: "Hello, p.username, welcome to p.servername", the bot would instead post: 
                "Hello, John, welcome to Doe"`,
            alias: null,
            required_permission: 'ADMINISTRATOR',
            async execute(message: Message, args: string) {
                var greetingMessage: string;
                var dmOrChannel: string;
                var channelToSend: string;
                var guildUser = message.guild.members.cache.find(member => member.id == message.author.id);
                if (guildUser.hasPermission(this.required_permission)) {
                    const dbClient = container.get<DbClient>(TYPES.DbClient);
                    const dbRepo = new Repository<ParabotSettings>(ParabotSettings, dbClient.db, "settings");
                    const filter = response => response.author.id == guildUser.id;
                    await message.reply(`I've recieved your request to configure my settings. Let's start off by configuring your greeting.`)
                    await message.channel.send(`Please enter the greeting message you wish to use. If you type p.username, it will replace that with the username of whoever joined. If you type p,servername, it will replace that with the name of the server.`);
                    await message.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] })
                        .then(async (collected) => {
                            var reply = collected.first().content as string;
                            await message.reply(`The greeting you have chosen to use is... "${reply}"`);
                            greetingMessage = reply;
                        }).catch(async () => {
                            await message.reply('Time has expired, please try again.');
                        });
                    await message.channel.send(`Do you wish to greet your new members in a text channel or in a direct message? Note: If you choose channel, I will greet users in this channel. [DM]/[Channel]`);
                    await message.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] })
                        .then(async (collected) => {
                            var reply = collected.first().content as string;
                            if (reply.toLowerCase() == "dm" || reply.toLowerCase() == "channel") {
                                await message.reply(`The option you have chosen is... "${reply}"`);
                                dmOrChannel = reply.toLowerCase();
                            }
                            else {
                                await message.reply(`I didn't recognize that option, defaulting to channel.`);
                                dmOrChannel = "channel";
                            }
                        }).catch(async () => {
                            await message.reply('Time has expired, please try again.');
                        });
                    if (dmOrChannel == "channel")
                        channelToSend = message.channel.id;
                    await message.channel.send(`Just to confirm, here are the settings I'm saving:\nGreeting Message: ${greetingMessage}\nDM Or Channel: ${dmOrChannel}\nChannel To Send Greetings To: ${(channelToSend == null ? "DM" : `<#${channelToSend}>`)}`);
                    await dbRepo.findById("NewMemberSettings").then(async (result) => {
                        if (result == null)
                            await dbRepo.insert(new ParabotSettings("NewMemberSettings", { "welcomeMessage": greetingMessage, "whereToGreet": dmOrChannel, "channelToGreet": channelToSend }));
                        else
                            await dbRepo.update(new ParabotSettings("NewMemberSettings", { "welcomeMessage": greetingMessage, "whereToGreet": dmOrChannel, "channelToGreet": channelToSend }))
                    })
                }
            }
        }
    ];
}
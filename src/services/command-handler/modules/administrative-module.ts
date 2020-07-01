import { Message, User, Guild, GuildMember, Collection, Emoji, Role, MessageEmbed } from 'discord.js';
import { Repository } from 'mongodb-typescript'
import { ModuleBase } from '../../../entities/module-base';
import container from '../../../inversify.config';
import { DbClient } from '../../../dbclient';
import { TYPES } from '../../../types';
import { ParabotSettings } from '../../../entities/parabot-settings';
import { Logger } from 'typescript-logging';

interface RoleEmotePair {
    readonly roleId: string;
    readonly emojiId: string;
}

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
                    await dbRepo.findById(`${message.guild.id}NewMemberSettings`).then(async (result) => {
                        if (result == null)
                            await dbRepo.insert(new ParabotSettings(`${message.guild.id}NewMemberSettings`, { "welcomeMessage": greetingMessage, "whereToGreet": dmOrChannel, "channelToGreet": channelToSend }));
                        else
                            await dbRepo.update(new ParabotSettings(`${message.guild.id}NewMemberSettings`, { "welcomeMessage": greetingMessage, "whereToGreet": dmOrChannel, "channelToGreet": channelToSend }))
                    })
                }
            }
        },
        {
            name: 'auto role',
            description: 'Will configure the settings for making auto role react messages',
            help_text: 'Run this command in the channel that you want to have Para.bot place a message that users can react to for different reactions',
            required_permission: 'ADMINISTRATOR',
            async execute(message: Message, args: string) {
                const wtf = container.get<Logger>(TYPES.GatewayConnectionLogger);
                var guildUser = message.guild.members.cache.find(member => member.id == message.author.id);
                if (guildUser.hasPermission(this.required_permission)) {
                    const dbClient = container.get<DbClient>(TYPES.DbClient);
                    const dbRepo = new Repository<ParabotSettings>(ParabotSettings, dbClient.db, "settings");
                    var roleEmoteDict = new Array<RoleEmotePair>();
                    await message.reply(`I've recieved your request to change my auto-role settings`);
                    const filter = response => response.author.id == guildUser.id;
                    await message.channel.send(`How many roles do you wish to configure?`);
                    var howManyRoles = await message.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] })
                        .then(async (collected): Promise<Number> => {
                            var reply = collected.first().content as string;
                            if (Number.parseInt(reply)) return Promise.resolve(Number.parseInt(reply));
                            else {
                                message.channel.send(`${reply} is not a number`);
                                return Promise.reject(`${reply} is not a number`);
                            }
                        });
                    message.channel.send(`You want to configure ${howManyRoles} roles for auto-assignment`);
                    wtf.info('wtf hello?');
                    for (var i = 0; i < howManyRoles; i++) {
                        await message.channel.send(`Which role would you like to set up?`);
                        var role = await message.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] })
                            .then(async (collected): Promise<Role> => {
                                var reply = collected.first().content as string;
                                var roleExtractionAttempt = message.guild.roles.cache.find(role => reply.includes(role.name));
                                if (roleExtractionAttempt) return Promise.resolve(roleExtractionAttempt);
                                else {
                                    message.channel.send(`${reply} is not a role`);
                                    return Promise.reject(`${reply} is not a role`);
                                }
                            }).catch(async error => {
                                console.log(error);
                                return Promise.reject(error);
                            });
                        await message.channel.send(`Which emoji would you like to use to assign the ${role.name} role?`);
                        var emote = await message.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] })
                            .then(async (collected): Promise<Emoji> => {
                                var reply = collected.first().content as string;
                                var emojiExtractionAttempt = message.guild.emojis.cache.find(emoji => reply.includes(emoji.id));
                                if (emojiExtractionAttempt) return Promise.resolve(emojiExtractionAttempt);
                                else {
                                    message.channel.send(`${reply} is not an emoji`);
                                    return Promise.reject(`${reply} is not an emoji`);
                                }
                            }).catch(async error => {
                                console.log(error);
                                return Promise.reject(error);
                            });
                        var duplicateEmoteAttempt = roleEmoteDict.find(entry => entry.emojiId == emote.id);
                        var duplicateRoleAttempt = roleEmoteDict.find(entry => entry.roleId == role.id);
                        if (duplicateRoleAttempt) message.channel.send(`${role.name} role is already defined`);
                        if (duplicateEmoteAttempt) message.channel.send(`${emote.name} emoji is already being used for something else`);
                        else roleEmoteDict.push({ roleId: role.id, emojiId: emote.id });
                    }
                    const embedBuilder = new MessageEmbed();
                    roleEmoteDict.forEach(entry => {
                        var emote = message.guild.emojis.cache.find(emote => emote.id == entry.emojiId);
                        embedBuilder.addFields(
                            {
                                name: `${emote}`,
                                value: `<@&${entry.roleId}>`,
                                inline: true
                            }
                        )
                    });
                    var messageToListen = await message.channel.send(embedBuilder);
                    roleEmoteDict.forEach(e => {
                        messageToListen.react(e.emojiId);
                    });
                    var settingsId = `${message.guild.id}autorolesettings`;
                    wtf.info(`${settingsId}`);
                    wtf.info(`"guildId": ${message.guild.id}`);
                    await dbRepo.findById(settingsId).then(async result => {
                        if (result == null) {
                            await dbRepo.insert(new ParabotSettings(settingsId, { "roleEmoteDict": roleEmoteDict, "guildId": message.guild.id, "channelId": messageToListen.channel.id, "messageToListen": messageToListen.id })).catch(error => {
                                console.log(error);
                            });
                            wtf.info('hewwo')
                        } else {
                            await dbRepo.update(new ParabotSettings(settingsId, { "roleEmoteDict": roleEmoteDict, "guildId": message.guild.id, "channelId": messageToListen.channel.id, "messageToListen": messageToListen.id })).catch(error => {
                                console.log(error);
                            });
                            wtf.info('hewwo2')
                        }
                    }).catch(error => {
                        console.log(error);
                    });

                }
            }
        }
    ];
}
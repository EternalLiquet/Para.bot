import container from '../inversify.config';
import { GuildMember, TextChannel } from 'discord.js';
import { injectable } from 'inversify';
import { TYPES } from '../types';
import { DbClient } from '../dbclient';
import { Repository } from 'mongodb-typescript';
import { ParabotSettings } from '../entities/parabot-settings';
import { Logger } from 'typescript-logging';

@injectable()
export class NewMemberHandler {
    channel: TextChannel;

    async handle(newGuildMember: GuildMember) {
        const settingsDb = container.get<DbClient>(TYPES.DbClient);
        const settingsRepo = new Repository<ParabotSettings>(ParabotSettings, settingsDb.db, "settings");
        const config = await settingsRepo.findById('NewMemberSettings').then(async (result) => {
            if (result == null) {
                result = new ParabotSettings("", {});
            }
            return result;
        });
        const welcomeMessage: string = (config.Settings['welcomeMessage'] == null) ? "Welcome to the server p.username!" : config.Settings['welcomeMessage'];
        const channelOrDm = (config.Settings['whereToGreet'] == null) ? "Channel" : config.Settings['whereToGreet'];
        const channelToGreetId = config.Settings['channelToGreet'] == null ? "FIRSTORDEFAULT" : config.Settings['channelToGreet'];

        var formattedWelcomeMessage = welcomeMessage.replace('p.username', newGuildMember.user.username).replace('p.servername', newGuildMember.guild.name);

        if (channelOrDm == 'channel') {
            console.log(channelToGreetId);
            if (channelToGreetId == "FIRSTORDEFAULT") {
                const channelList = newGuildMember.guild.channels.cache.array();
                for (let channel of channelList) {
                    try {
                        var textChannel = channel as TextChannel;
                        textChannel.send(formattedWelcomeMessage);
                        break;
                    }
                    catch (e) {
                    }
                }
            } else {
                var channel = newGuildMember.guild.channels.cache.find(channel => channel.id == channelToGreetId) as TextChannel;
                channel.send(formattedWelcomeMessage);
            }
        }
        else {
            newGuildMember.user.send(formattedWelcomeMessage);
        }
    }
}
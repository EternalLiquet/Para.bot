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
            return result;
        });
        const welcomeMessage: string = config.Settings['welcomeMessage'];
        const channelOrDm = config.Settings['whereToGreet'];
        const channelToGreetId = config.Settings['channelToGreet'];

        var formattedWelcomeMessage = welcomeMessage.replace('p.username', newGuildMember.user.username).replace('p.servername', newGuildMember.guild.name);

        if(channelOrDm == 'Channel') {
            var channel = newGuildMember.guild.channels.find(channel => channel.id == channelToGreetId) as TextChannel;
            channel.send(formattedWelcomeMessage);
        }
        else {
            newGuildMember.user.send(formattedWelcomeMessage);
        }
    }
}
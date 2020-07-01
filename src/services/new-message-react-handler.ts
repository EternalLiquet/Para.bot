import container from '../inversify.config';
import { GuildMember, User, MessageReaction } from 'discord.js';
import { injectable } from 'inversify';
import { TYPES } from '../types';
import { DbClient } from '../dbclient';
import { Repository } from 'mongodb-typescript';
import { ParabotSettings } from '../entities/parabot-settings';
import { Logger } from 'typescript-logging';

@injectable()
export class NewMessageReactHandler {
    async handle(messageReact: MessageReaction, user: User) {
        const messageReactId = messageReact.emoji.id;
        const guild = messageReact.message.guild;
        const settingsDb = container.get<DbClient>(TYPES.DbClient);
        const settingsRepo = new Repository<ParabotSettings>(ParabotSettings, settingsDb.db, "settings");
        const config = await settingsRepo.findById(`${messageReact.message.guild.id}autorolesettings`);
        if (config == undefined) return;
        if (messageReact.message.id != config.Settings['messageToListen']) return;
        const roleEmoteDict = config.Settings['roleEmoteDict'];
        console.log(messageReactId);
        var roleId;
        roleEmoteDict.forEach(async entry => {
            console.log(entry.emojiId);
            if (entry.emojiId == messageReactId) {
                console.log(true)
                roleId = entry.roleId;
            }
        });
        const role = guild.roles.cache.find(role => role.id == roleId);
        const guildUser = guild.members.cache.find(guildUser => guildUser.id == user.id);
        guildUser.roles.add(role);
    }
}
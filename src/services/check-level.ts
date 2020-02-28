import container from '../inversify.config';
import { Message } from 'discord.js';
import { injectable } from 'inversify';
import { TYPES } from '../types';
import { DbClient } from '../dbclient';
import { Repository } from 'mongodb-typescript'
import { ParabotUser } from '../entities/parabot-user';
import { ParabotLevel } from '../entities/parabot-levels';

@injectable()
export class LevelCheck {
    async handle(message: Message): Promise<Message | Message[]> {
        if (message.content.trim().toLowerCase() == "p.checklevel") {
            var parabotUserId = message.author.id + message.guild.id;
            var userRepo = new Repository<ParabotUser>(ParabotUser, container.get<DbClient>(TYPES.DbClient).db, "users");
            var levelRepo = new Repository<ParabotLevel>(ParabotLevel, container.get<DbClient>(TYPES.DbClient).db, "levels")
            await userRepo.findById(parabotUserId).then(async (user) => {
                if(user == null) {
                    await message.reply(`${message.author.username} you currently do not have a level!`);
                } else {
                    await levelRepo.findById(user.Level + 1).then(async (levelRequirements) => {
                        await message.reply(`${message.author.username} you are currently level ${user.Level}! You have ${user.Exp}/${levelRequirements.ExpRequirement} exp to get to the next level`);
                    });  
                }
            });
        }
        return Promise.reject(new Error('Message does not match command'));
    }
}
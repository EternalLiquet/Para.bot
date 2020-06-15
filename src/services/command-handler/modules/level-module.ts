import { Message } from 'discord.js';
import { Repository } from 'mongodb-typescript'
import container from '../../../inversify.config';
import { DbClient } from '../../../dbclient';
import { TYPES } from '../../../types';
import { ParabotUser } from '../../../entities/parabot-user';
import { ParabotLevel } from '../../../entities/parabot-levels';

export class LevelModule {    
    public ModuleCommandList = [
        {
            name: 'checklevel',
            description: 'Will return what level you are',
            help_text: `Use this command to check what level you are and how much experience you have.`,
            alias: 'check level',
            async execute(message: Message, args: string) {
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
        }
    ];
}
import { Message } from "discord.js";
import { Repository } from "mongodb-typescript";
import { ParabotUser } from "../../../entities/parabot-user";
import { ParabotLevel } from "../../../entities/parabot-levels";
import { DbClient } from "../../../dbclient";
import { TYPES } from "../../../types";
import container from "../../../inversify.config";

export class LevelModule {
    public ModuleCommandList = [
        {
            name: 'checklevel',
            description: 'Check your level, exp and exp requirement for the next level',
            help_text: `The bot will return your current level, as well as the amount of 
            exp you have right now and the exp you need to get to the next level`,
            async execute(message: Message, args: string) {
                if(message.guild == null) return await message.reply(`This command is only available in a server`);
                var parabotUserId = message.author.id + message.guild.id;
                var userRepo = new Repository<ParabotUser>(ParabotUser, container.get<DbClient>(TYPES.DbClient).db, "users");
                var levelRepo = new Repository<ParabotLevel>(ParabotLevel, container.get<DbClient>(TYPES.DbClient).db, "levels")
                await userRepo.findById(parabotUserId).then(async (user) => {
                    if (user == null) {
                        await message.reply(`${message.author.username} you currently do not have a level!`);
                    } else {
                        await levelRepo.findById(user.Level + 1).then(async (levelRequirements) => {
                            await message.reply(`${message.author.username} you are currently level ${user.Level}! You have ${user.Exp}/${levelRequirements.ExpRequirement} exp to get to the next level`);
                        });
                    }
                });
            }
        }
    ]
}
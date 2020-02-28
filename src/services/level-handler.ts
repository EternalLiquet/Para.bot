require('dotenv').config();
import container from '../inversify.config';
import { Message } from 'discord.js';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { DbClient } from '../dbclient';
import { ParabotUser } from '../entities/parabot-user'
import { Repository } from 'mongodb-typescript'
import { ParabotLevel } from '../entities/parabot-levels';
import { Logger } from 'typescript-logging';

@injectable()
export class LevelHandler{

    private serviceLogger = container.get<Logger>(TYPES.LevelHandlerLogger);

    constructor(
        @inject(TYPES.LevelHandlerLogger) serviceLogger: Logger
    ){
    }

    async handle(message: Message): Promise<string> {
        const mongoClient = container.get<DbClient>(TYPES.DbClient);
        var parabotUserId = message.author.id + message.guild.id;
        this.serviceLogger.info(`Level Handler entered for user: ${message.author.username} with Parabot User ID: ${parabotUserId}`);
        var userRepo = new Repository<ParabotUser>(ParabotUser, mongoClient.db, "users");
        this.serviceLogger.debug(`Level Handler MongoDB Connected`);
        await userRepo.findById(parabotUserId).then(async (user) => {
            this.serviceLogger.info(`DB Search Result for user ${message.author.username}: ${user == null ? "Not Found" : user.UserName}`);
            if(user == null) {
                var newUser = new ParabotUser();
                newUser.fill_user_properties_from_message(message);
                await userRepo.insert(newUser);
                this.serviceLogger.warn(`${message.author.username} was not found in the database, creating a new Parabot User`);
            }
            else {
                this.serviceLogger.debug(`${user.UserName} from ${user.ServerName} was found in the database at level ${user.Level} with ${user.Exp} experience`)
                await this.handleLeveling(message, user).then(async (result) => {
                    this.serviceLogger.debug(`${result.UserName} from ${result.ServerName} is being updated with a level of ${result.Level} with ${result.Exp} experience`);
                    await userRepo.update(result);
                }).catch((error) => {
                    this.serviceLogger.error(error);
                });
            }
        });
        this.serviceLogger.info(`Level Handling Complete for ${message.author.username}`);
        return Promise.resolve("Level Handler Process Complete");
    }


    private async handleLeveling(message: Message, userFromDb: ParabotUser): Promise<ParabotUser>{
        if(this.isOnCooldown(message, userFromDb)) {
            return Promise.reject(`User ${userFromDb.UserName} is on cooldown in server: ${userFromDb.ServerName}`);
        }
        userFromDb.give_exp(1);
        userFromDb.reset_cooldown(message.createdTimestamp);
        await this.checkIfLevelUpEligible(userFromDb).then((eligible) => {
            if(eligible) {
                userFromDb.level_up(1)
                message.channel.send(`Congratulations, you have reached level ${userFromDb.Level}`).then(() => {
                    this.serviceLogger.info(`User ${userFromDb.UserName} has been notified of level up!`);
                }).catch((error) => {
                    this.serviceLogger.error(`Something went wrong notifying user ${userFromDb.UserName} of their level: ${error}`);
                });
                return userFromDb;
            }
        });
        return Promise.resolve(userFromDb);
    }

    private isOnCooldown(message:Message, userFromDb: ParabotUser): Boolean {
        var fiveMinutesInMilliseconds = 300000;
        var diffInMilliseconds = message.createdTimestamp - userFromDb.CooldownDTM;
        if(diffInMilliseconds <= fiveMinutesInMilliseconds)
            return true;
        else
            return false;
    }

    private async checkIfLevelUpEligible(user: ParabotUser): Promise<Boolean> {
        const mongoClient = container.get<DbClient>(TYPES.DbClient);
        var levelRepo = new Repository<ParabotLevel>(ParabotLevel, mongoClient.db, "levels");
        var levelRequirements = await levelRepo.findById(user.Level + 1).then(async (result) => {
            return Promise.resolve(result);
        });
        this.serviceLogger.debug(`${user.UserName} with ${user.Exp} experience requires ${levelRequirements.ExpRequirement} experience to level up`);
        if(user.Exp >=  levelRequirements.ExpRequirement){
            return Promise.resolve(true);
        }
        return Promise.resolve(false);
    }
}

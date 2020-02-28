import { Message } from 'discord.js';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { DbClient } from '../dbclient';
import { ParabotUser } from '../entities/parabot-user'
import { Repository } from 'mongodb-typescript'
import { ParabotLevel } from '../entities/parabot-levels';
import container from '../inversify.config';
import { Logger } from 'typescript-logging';


@injectable()
export class LevelHandler{

    private usersDb: DbClient;
    private levelsDb: DbClient;
    private serviceLogger = container.get<Logger>(TYPES.LevelHandlerLogger);

    constructor(
        @inject(TYPES.DbClient) usersDb: DbClient,
        @inject(TYPES.DbClient) levelsDb: DbClient,
        @inject(TYPES.LevelHandlerLogger) serviceLogger: Logger
    ){
        this.usersDb = usersDb;
        this.levelsDb = levelsDb;
    }

    async handle(message: Message): Promise<string> {
        var parabotUserId = message.author.id + message.guild.id;
        this.serviceLogger.info(`Level Handler entered for user: ${message.author.username} with Parabot User ID: ${parabotUserId}`);
        await this.usersDb.connect();
        var userRepo = new Repository<ParabotUser>(ParabotUser, this.usersDb.db, "users");
        this.serviceLogger.debug(`Level Handler MongoDB Connected`);
        await userRepo.findById(parabotUserId).then((user) => {
            this.serviceLogger.info(`DB Search Result for user ${message.author.username}: ${user == null ? "Not Found" : user.UserName}`);
            if(user == null) {
                var newUser = new ParabotUser();
                newUser.fill_user_properties_from_message(message);
                userRepo.insert(newUser);
                this.serviceLogger.warn(`${message.author.username} was not found in the database, creating a new Parabot User`);
            }
            else {
                this.serviceLogger.debug(`${user.UserName} from ${user.ServerName} was found in the database`)
                this.handleLeveling(message, user).then((result) => {
                    userRepo.update(result);
                }).catch((error) => {
                    console.log(error);
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
                console.log('user leveled up');
                console.log('1', userFromDb.Level)
                return userFromDb.level_up(1);
               
            }
        });
        console.log('2', userFromDb.Level)
        return Promise.resolve(userFromDb);
    }

    private isOnCooldown(message:Message, userFromDb: ParabotUser): Boolean {
        var fiveMinutesInMilliseconds = 5000;
        var diffInMilliseconds = message.createdTimestamp - userFromDb.CooldownDTM;
        if(diffInMilliseconds <= fiveMinutesInMilliseconds)
            return true;
        else
            return false;
    }

    private async checkIfLevelUpEligible(user: ParabotUser): Promise<Boolean> {
        await this.levelsDb.connect();
        var levelRepo = new Repository<ParabotLevel>(ParabotLevel, this.levelsDb.db, "levels");
        var levelRequirements = await levelRepo.findById(user.Level + 1).then(async (result) => {
            return Promise.resolve(result);
        });
        console.log(levelRequirements);
        if(user.Exp >=  levelRequirements.ExpRequirement){
            return Promise.resolve(true);
        }
        return Promise.resolve(false);
    }
}

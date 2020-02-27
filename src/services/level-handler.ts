import { Message } from 'discord.js';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { DbClient } from '../dbclient';
import { ParabotUser } from '../entities/parabot-user'
import { Repository } from 'mongodb-typescript'
import { ParabotLevels } from '../entities/parabot-levels';

@injectable()
export class LevelHandler{
    private dbClient: DbClient;

    constructor(
        @inject(TYPES.DbClient) dbClient: DbClient
    ){
        this.dbClient = dbClient;
    }

    async handle(message: Message): Promise<string> {
        var userId = message.author.id;
        var serverId = message.guild.id;
        var parabotUserId = userId + serverId;
        this.dbClient.connect();
        var userRepo = new Repository<ParabotUser>(ParabotUser, this.dbClient.db, "users");
        await userRepo.findById(parabotUserId).then((user) => {
            if(user == null) {
                var newUser = new ParabotUser();
                newUser.fill_user_properties_from_message(message);
                userRepo.insert(newUser);
            }
            else {
                this.handleLeveling(message, user).then((result) => {
                    userRepo.update(result);
                }).catch((error) => {
                    console.log(error);
                });
            }
        });
        return;
    }


    private handleLeveling(message: Message, userFromDb: ParabotUser): Promise<ParabotUser>{
        if(this.isOnCooldown(message, userFromDb)) {
            return Promise.reject(`User ${userFromDb.UserName} is on cooldown in server: ${userFromDb.ServerName}`);
        }
        userFromDb.give_exp(1);
        userFromDb.reset_cooldown(message.createdTimestamp);
        console.log(this.checkIfLevelUpEligible(userFromDb));
        if(this.checkIfLevelUpEligible(userFromDb)) {
            userFromDb.level_up(1);
            console.log('user leveled up');
        }
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

    private checkIfLevelUpEligible(user: ParabotUser): Boolean {
        var levelRepo = new Repository<ParabotLevels>(ParabotLevels, this.dbClient.db, "levels");
        this.ensure_exp_requirements_collection_exists(levelRepo);
        levelRepo.findById(user.Level + 1).then((result) => {
            console.log(user.Level + 1);
            console.log(user.Exp);
            console.log(result.Level);
            console.log(result.ExpRequirement);
            console.log(user.Exp >= result.ExpRequirement);
            if(user.Exp >= result.ExpRequirement) {
                console.log('evaluates true');
                return true;
            }
            else {
                return false;
            }
        });
        return;
    }

    private ensure_exp_requirements_collection_exists(levelRepo: Repository<ParabotLevels>) {
        levelRepo.count().then((result) => {
            if (result == 0) {
                this.create_exp_threshholds().forEach(expThreshHold => {
                    levelRepo.insert(expThreshHold);
                });
            }
        });
    }

    private create_exp_threshholds(): ParabotLevels[] {
        var threshHolds = [2, 3, 5, 8, 15, 20, 25, 30, 35, 40, 50];
        var levelArray = [];
        var i = 1;
        threshHolds.forEach(threshHold => {
            levelArray.push(new ParabotLevels(i, threshHold));
            i++;
        });
        return levelArray;
    };
}

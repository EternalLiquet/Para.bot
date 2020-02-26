import { Message, User } from 'discord.js';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { DbClient } from '../dbclient';
import { Db } from 'mongodb'
import { ParabotUser } from '../entities/parabot-user'
import { Repository } from 'mongodb-typescript'

@injectable()
export class LevelHandler{
    private dbClient: DbClient;
    private dbo: Db;
    private collection: any;

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
        const repo = new Repository<ParabotUser>(ParabotUser, this.dbClient.db, "users");
        await repo.findById(parabotUserId).then((user) => {
            if(user == null) {
                var newUser = new ParabotUser();
                newUser.fill_user_properties_from_message(message);
                repo.insert(newUser);
            }
            else {
                this.handleLeveling(message, user).then((result) => {
                    console.log(result);
                    repo.update(user)
                }).catch((error) => {
                    console.log(error);
                });
            }
        });
        /**
        var userFromDb = await this.dbClient.connect().then(async () => {
            this.dbo = this.dbClient.db.db("parabotdb");
            this.collection = this.dbo.collection("users");
            return await this.collection.findOne({ParabotUserId: parabotUserId}).then((result) =>{
                return result;
            });
        });
        **/
        return;
    }


    private handleLeveling(message: Message, userFromDb: ParabotUser): Promise<ParabotUser>{
        console.log(userFromDb.ParabotUserId);
        if(this.isOnCooldown(message, userFromDb))
        {
            return Promise.reject(`User ${userFromDb.UserName} is on cooldown in server: ${userFromDb.ServerName}`);
        }
        console.log(userFromDb.Exp);
        userFromDb.give_exp(1);
        userFromDb.reset_cooldown(message.createdTimestamp);
        console.log(userFromDb.Exp);
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

    private addExperienceToUser(user: ParabotUser){
        user.give_exp(1);
    }
}

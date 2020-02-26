import { Message } from 'discord.js';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { DbClient } from '../dbclient';
import { Db } from 'mongodb'

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
        console.log(userId, serverId, parabotUserId);
        var userFromDb = await this.dbClient.connect().then(async () => {
            this.dbo = this.dbClient.db.db("parabotdb");
            this.collection = this.dbo.collection("users");
            return await this.collection.findOne({ParabotUserId: parabotUserId}).then((result) =>{
                return result;
            });
        });
        if(userFromDb == null){
            this.createNewUserInDB(message);
        }
        return;
    }

    private createNewUserInDB(message: Message){
        console.log('New user recorded');
        var userId = message.author.id;
        var serverId = message.guild.id;
        var parabotUserId = userId + serverId;
        this.collection.insertOne({ "ParabotUserId": parabotUserId, "UserName": message.author.username, "ServerName": message.guild.name, "LastSentMessageDTM": message.createdTimestamp});
    }
}
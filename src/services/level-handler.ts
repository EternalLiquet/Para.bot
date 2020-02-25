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
        await this.dbClient.connect();
        this.dbo = this.dbClient.db.db("parabotdb");
        this.collection = this.dbo.collection("users");
        var results = this.collection.find({UserId: userId}).toArray();
        console.log(results.length)
        if(results.length == 0) {
            this.createNewUserEntry(message);
        }
        this.dbClient.db.close();
        return;
    }

    private createNewUserEntry(message: Message){
        console.log("DoIevenreachhere XD");
        this.collection.insertOne({ "UserId": message.author.id });
    }
}
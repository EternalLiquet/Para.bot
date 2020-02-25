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

    handle(message: Message): Promise<string> {
        var userId = message.author.id;
        this.dbClient.connect();
        this.dbo = this.dbClient.db;
        this.collection = this.dbo.collection("users");
        var results = this.collection.find({UserId : userId});
        if(results.count() == 0)
            this.createNewUserEntry(message);
        
        this.dbo.close();
        return;
    }

    private createNewUserEntry(message: Message){
        this.collection.insertOne({ "UserId": message.author.id });
    }
}
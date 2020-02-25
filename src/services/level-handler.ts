import { Message } from 'discord.js';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { DbClient } from '../dbclient';

@injectable()
export class LevelHandler{
    private dbClient: DbClient;

    constructor(
        @inject(TYPES.DbClient) dbClient: DbClient
    ){
        this.dbClient = dbClient;
    }

    handle(message: Message): Promise<Message | Message[]> {
        
        return Promise.reject(new Error('Message ignored for reason'))
    }
}
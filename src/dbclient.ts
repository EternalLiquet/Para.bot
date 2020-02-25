import { MongoClient, Db } from "mongodb";
import { injectable, inject } from "inversify";
import { TYPES } from "./types"
import { Logger } from "typescript-logging";

@injectable()
export class DbClient {
    public db: Db;
    private dbConnectionString: string;
    private dbConnectionLogger: Logger;

    constructor(
        @inject(TYPES.DbConnectionString) dbConnectionString : string,
        @inject(TYPES.DatabaseConnectionLogger) dbConnectionLogger : Logger
    ){
        this.dbConnectionString = dbConnectionString;
        this.dbConnectionLogger = dbConnectionLogger;
        useUnifiedTopology: true;
    }

    public async connect() {
        try {
            this.db = await MongoClient.connect(this.dbConnectionString);
            this.dbConnectionLogger.info('Connected to MongoDB');
            return this.db;
        } catch (error) {
            this.dbConnectionLogger.fatal('Unable to connect to MongoDB');
        }
    }
}

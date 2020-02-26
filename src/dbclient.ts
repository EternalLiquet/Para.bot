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
        @inject(TYPES.DbConnectionString) dbConnectionString: string,
        @inject(TYPES.DatabaseConnectionLogger) dbConnectionLogger: Logger
    ) {
        this.dbConnectionString = dbConnectionString;
        this.dbConnectionLogger = dbConnectionLogger;
    }

    public async connect() {
        await MongoClient.connect(this.dbConnectionString).then((db) => {
            this.dbConnectionLogger.info('Successfully Connected to MongoDB');
            this.db = db;
        }).catch((error) => {
            this.dbConnectionLogger.fatal(`Could not connect to MongoDB for reason: ${error}`);
            process.exit();
        });
    }
}

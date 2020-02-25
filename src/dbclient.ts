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
    }

    public async connect() {
        try {
            this.db = await MongoClient.connect(this.dbConnectionString);
            this.ensure_db_exists();
            this.dbConnectionLogger.info('Successfully Connected to MongoDB');
            return this.db;
        } catch (error) {
            this.dbConnectionLogger.fatal(`Unable to connect to MongoDB for reason: ${error}`);
            process.exit();
        }
    }

    private ensure_db_exists() {
        this.dbConnectionLogger.info('Attempting connection to MongoDB');
        var dbo = this.db.db("parabotdb");
        this.dbConnectionLogger.info('Making sure ParabotDB exists');
        var collection = dbo.collection("users");
        this.dbConnectionLogger.info('Making sure user collection exists');
        collection.insertOne({ "pilot_doc": "pilot_doc" });
        collection.deleteOne({ pilot_doc: "pilot_doc" });
        this.dbConnectionLogger.info('Making sure to save the state of the db');
    }
}

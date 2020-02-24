import { MongoClient, Db } from "mongodb";
import { injectable } from "inversify";

@injectable()
class DbClient {
    public db: Db;

    public connect() {}
}

export = new DbClient();

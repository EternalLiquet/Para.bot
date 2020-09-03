﻿using MongoDB.Driver;

using Serilog;

namespace Para.bot.Util
{
    public static class MongoDbClient
    {
        public static MongoClient client;
        public static IMongoDatabase beanDatabase;
        public static void InstantiateMongoDriver()
        {
            Log.Information("Instantiating Database Connection");
            var mongoConnectionString = AppSettings.Settings["mongoConnectionString"];
            client = new MongoClient(mongoConnectionString);
            beanDatabase = client.GetDatabase("parabotdb");
            Log.Information("Database Connection complete");
        }
    }
}

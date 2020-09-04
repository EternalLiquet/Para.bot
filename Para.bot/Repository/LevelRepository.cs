using MongoDB.Bson;
using MongoDB.Driver;
using Para.bot.Entities;
using Para.bot.Util;
using Serilog;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Para.bot.Repository
{
    public class LevelRepository
    {
        private IMongoCollection<ParabotLevel> _collection = MongoDbClient.beanDatabase.GetCollection<ParabotLevel>("levels");
        public async Task<List<ParabotLevel>> GetExpRequirements() 
        {
            throw new NotImplementedException();
        }

        public async Task<bool> CheckIfExpRequirementsCollectionExists()
        {
            try
            {
                switch (await _collection.CountDocumentsAsync(new BsonDocument()))
                {
                    case 0:
                        Log.Error($"Exp Requirements collection not found");
                        return false;
                    default:
                        Log.Information($"Exp Requirements collection found");
                        return true;
                }
            }
            catch
            {
                Log.Error($"Error trying to find Exp Requirements collection");
                return false;
            }
        }

        public async Task CreateLevelCollection(List<ParabotLevel> parabotLevelList)
        {
            try
            {
                foreach (var level in parabotLevelList)
                {
                    await _collection.InsertOneAsync(level);
                }
                Log.Information("Parabot Level Collection creation complete");
            }
            catch
            {
                Log.Error("Error creating Parabot Level Collection");
            }
        }
    }
}

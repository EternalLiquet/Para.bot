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
    public class ProfanityFilterRepository
    {
        private IMongoCollection<ParabotProfanityFilterList> _profanityCollection = MongoDbClient.beanDatabase.GetCollection<ParabotProfanityFilterList>("profanityFilter");

        public async Task InsertProfanityListAsync(ParabotProfanityFilterList profanityFilterList)
        {
            try
            {
                await _profanityCollection.InsertOneAsync(profanityFilterList);
                Log.Information("Profanity filter list created");
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error inserting into database");
            }
        }

        public async Task UpdateProfanityListAsync(ParabotProfanityFilterList profanityFilterList)
        {
            try
            {
                var filterOne = Builders<ParabotProfanityFilterList>.Filter.Eq("ServerId", profanityFilterList.ServerId);
                await _profanityCollection.ReplaceOneAsync(filterOne, profanityFilterList);
                Log.Information("Profanity filter list updated successfully");
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error editing database");
            }
        }

        public async Task<ParabotProfanityFilterList> GetProfanityListAsync(ulong serverId)
        {
            try
            {
                var filter = Builders<ParabotProfanityFilterList>.Filter.Eq("ServerId", serverId);
                var result = await _profanityCollection.FindAsync(filter);
                return result.FirstOrDefault();
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error retrieving settings from database");
                return null;
            }
        }
    }
}

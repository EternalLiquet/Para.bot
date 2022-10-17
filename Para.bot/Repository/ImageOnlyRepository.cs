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
    public class ImageOnlyRepository
    {
        private IMongoCollection<ParabotImageOnlyChannelList> _imageOnlyChannelRepo = MongoDbClient.beanDatabase.GetCollection<ParabotImageOnlyChannelList>("imageOnlyChannelList");

        public async Task InsertListOfImageOnlyChannels(ParabotImageOnlyChannelList imageOnlyChannelList)
        {
            try
            {
                await _imageOnlyChannelRepo.InsertOneAsync(imageOnlyChannelList);
                Log.Information("Image only channel list created");
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error inserting into database");
            }
        }

        public async Task UpdateListOfImageOnlyChannels(ParabotImageOnlyChannelList imageOnlyChannelList)
        {
            try
            {
                var filterOne = Builders<ParabotImageOnlyChannelList>.Filter.Eq("ServerId", imageOnlyChannelList.ServerId);
                await _imageOnlyChannelRepo.ReplaceOneAsync(filterOne, imageOnlyChannelList);
                Log.Information("Image only channel list updated successfully");
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error editing database");
            }
        }

        public async Task<ParabotImageOnlyChannelList> GetListOfImageOnlyChannels(ulong serverId)
        {
            try
            {
                var filter = Builders<ParabotImageOnlyChannelList>.Filter.Eq("ServerId", serverId);
                var result = await _imageOnlyChannelRepo.FindAsync(filter);
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

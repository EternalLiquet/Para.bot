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
    public class SettingsRepository
    {
        private IMongoCollection<ParabotSettings> _settingsCollection = MongoDbClient.beanDatabase.GetCollection<ParabotSettings>("settings");
        public async Task InsertNewSettings(ParabotSettings parabotSettings)
        {
            try
            {
                await _settingsCollection.InsertOneAsync(parabotSettings);
                Log.Information($"Settings successfully updated");
            }
            catch
            {
                Log.Error($"Error inserting settings into database");
            }
        }
    }
}

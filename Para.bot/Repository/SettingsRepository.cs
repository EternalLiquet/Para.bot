using Discord.WebSocket;
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
                Log.Information($"Settings successfully created");
            }
            catch (Exception e)
            {
                Log.Error($"Error inserting settings into database: {e.Message}");
            }
        }

        public async Task<List<ParabotSettings>> GetGreetingSettings(SocketGuild guild)
        {
            try
            {
                var filterOne = Builders<ParabotSettings>.Filter.Eq("SettingsType", $"{guild.Id}NewMemberSettings");
                var results = await _settingsCollection.FindAsync<ParabotSettings>(filterOne);
                return await results.ToListAsync();
            }
            catch (Exception e)
            {
                Log.Error($"Error retrieving greeting settings from the database: {e.Message}");
                return null;
            }
        }

        public async Task ReplaceSettings(ParabotSettings newGreetingSettings)
        {
            try
            {
                var filterOne = Builders<ParabotSettings>.Filter.Eq("SettingsType", newGreetingSettings.SettingsType);
                await _settingsCollection.ReplaceOneAsync(filterOne, newGreetingSettings);
                Log.Information("Settings successfully created");
            }
            catch (Exception e)
            {
                Log.Error($"Error inserting settings into database: {e.Message}");
            }
        }

        public async Task InsertNewRoleSettings(ParabotSettings roleSettings)
        {
            try
            {
                await _settingsCollection.InsertOneAsync(roleSettings);
                Log.Information($"Settings successfully created");
            }
            catch (Exception e)
            {
                Log.Error($"Error inserting settings into database: {e.Message}");
            }
        }

        public async Task<List<ParabotSettings>> GetRoleSettings()
        {
            try
            {
                var filterByType = Builders<ParabotSettings>.Filter.Where(result => result.SettingsType.Contains("AutoRoleSettings"));
                var results = await _settingsCollection.FindAsync<ParabotSettings>(filterByType);
                return await results.ToListAsync();
            }
            catch (Exception e)
            {
                Log.Error($"Error retrieving role settings from the database: {e.Message}");
                return null;
            }
        }
    }
}

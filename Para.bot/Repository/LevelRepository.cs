using Discord.WebSocket;

using MongoDB.Bson;
using MongoDB.Driver;

using Para.bot.Entities;
using Para.bot.Util;

using Serilog;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Para.bot.Repository
{
    public class LevelRepository
    {
        private string _parabotUserId;
        private string _username;
        private string _serverName;
        private ulong _discordId;
        private ulong _serverId;

        private IMongoCollection<ParabotLevel> _levelCollection = MongoDbClient.beanDatabase.GetCollection<ParabotLevel>("levels");
        private IMongoCollection<ParabotUser> _userCollection = MongoDbClient.beanDatabase.GetCollection<ParabotUser>("users");

        public LevelRepository() { }
        public LevelRepository(SocketMessage discordMessage)
        {
            var guildChannel = discordMessage.Channel as SocketTextChannel;
            this._parabotUserId = $"{discordMessage.Author.Id}{guildChannel.Guild.Id}";
            Log.Information(_parabotUserId);
            this._username = discordMessage.Author.Username;
            this._serverName = guildChannel.Guild.Name;
            this._discordId = discordMessage.Author.Id;
            this._serverId = guildChannel.Guild.Id;
        }

        public async Task<List<ParabotLevel>> GetExpRequirements()
        {
            try
            {
                var levelRequirements = await _levelCollection.FindAsync<ParabotLevel>(new BsonDocument());
                return levelRequirements.ToList();
            }
            catch (Exception e)
            {
                Log.Error($"Error pulling Exp Requirements collection for reason: {e.Message}");
                return null;
            }
        }

        public async Task UpdateParabotUser(ParabotUser parabotUser)
        {
            var filterUser = Builders<ParabotUser>.Filter.Eq("_id", _parabotUserId);
            try
            {
                await _userCollection.FindOneAndReplaceAsync<ParabotUser>(filterUser, parabotUser);
                Log.Information($"Successfully updated Parabot User {parabotUser.UserName} from server {parabotUser.ServerName}");
            }
            catch
            {
                Log.Error($"Error updating Parabot User {parabotUser.UserName} from server {parabotUser.ServerName}");
            }
        }

        public async Task<bool> CheckIfExpRequirementsCollectionExists()
        {
            try
            {
                switch (await _levelCollection.CountDocumentsAsync(new BsonDocument()))
                {
                    case 0:
                        Log.Error($"Exp Requirements collection not found");
                        return false;
                    default:
                        Log.Information($"Exp Requirements collection found");
                        return true;
                }
            }
            catch (Exception e)
            {
                Log.Error($"Error trying to find Exp Requirements collection for reason: {e.Message}");
                return false;
            }
        }

        public async Task InsertNewUser(ParabotUser parabotUser)
        {
            try
            {
                await _userCollection.InsertOneAsync(parabotUser);
                Log.Information($"User {parabotUser.UserName} with ParabotId {parabotUser.ParabotUserId} has been inserted into the database");
            }
            catch
            {
                Log.Error($"User {parabotUser.UserName} with ParabotId {parabotUser.ParabotUserId} has failed inserting into the database");
            }
        }

        public async Task<List<ParabotUser>> ReturnUserByParabotUserId()
        {
            try
            {
                var filterUser = Builders<ParabotUser>.Filter.Eq("_id", _parabotUserId);
                var queryResult = await _userCollection.FindAsync<ParabotUser>(filterUser);
                return await queryResult.ToListAsync();
            }
            catch (Exception e)
            {
                Log.Error($"Error trying to find Parabot User {_username} for reason: {e.Message}");
                return null;
            }
        }

        public async Task CreateLevelCollection(List<ParabotLevel> parabotLevelList)
        {
            try
            {
                foreach (var level in parabotLevelList)
                {
                    await _levelCollection.InsertOneAsync(level);
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

using Discord.WebSocket;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Text;

namespace Para.bot.Entities
{
    public class ParabotUser
    {
        [BsonId]
        public string ParabotUserId { get; set; }
        public string UserName { get; set; }
        public string ServerName { get; set; }
        public ulong DiscordId { get; set; }
        public ulong ServerId { get; set; }
        public long CooldownDTM { get; set; }
        public int Exp { get; set; }
        public int Level { get; set; }

        public ParabotUser(SocketMessage discordMessage)
        {
            var discordChannel = discordMessage.Channel as SocketTextChannel;
            this.ParabotUserId = $"{discordMessage.Author.Id}{discordChannel.Guild.Id}";
            this.UserName = discordMessage.Author.Username;
            this.ServerName = discordChannel.Guild.Name;
            this.DiscordId = discordMessage.Author.Id;
            this.ServerId = discordChannel.Guild.Id;
            this.CooldownDTM = discordMessage.Timestamp.ToUnixTimeMilliseconds();
            this.Exp = 1;
            this.Level = 0;
        }

        public void GiveExp(int expToGive)
        {
            this.Exp += expToGive;
        }

        public void ResetCooldown(long timestamp)
        {
            this.CooldownDTM = timestamp;
        }

        public void LevelUp()
        {
            this.Level++;
            this.Exp = 0;
        }

        public override string ToString()
        {
            return $"ParabotUserId: {ParabotUserId}\nUserName: {UserName}\nServerName: {ServerName}\nDiscordId: {DiscordId}\nServerId: {ServerId}\nCooldownDTM: {CooldownDTM}\nExp: {Exp}\nLevel: {Level}";
        }
    }
}

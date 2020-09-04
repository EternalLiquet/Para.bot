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
        public string Username { get; set; }
        public string ServerName { get; set; }
        public ulong DiscordId { get; set; }
        public ulong ServerId { get; set; }
        public ulong CooldownDTM { get; set; }
        public int Exp { get; set; }
        public int Level { get; set; }
    }
}

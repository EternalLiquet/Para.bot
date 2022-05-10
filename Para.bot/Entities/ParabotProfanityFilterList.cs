using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Text;

namespace Para.bot.Entities
{
    public class ParabotProfanityFilterList
    {
        [BsonId]
        public ulong ServerId { get; set; }
        public List<string> ProfanityList { get; set; }
        public bool Enabled { get; set; }

        public ParabotProfanityFilterList(ulong serverId, List<string> profanityList, bool enabled)
        {
            ServerId = serverId;
            ProfanityList = profanityList;
            Enabled = enabled;
        }
    }
}

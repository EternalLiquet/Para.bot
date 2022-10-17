using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Text;

namespace Para.bot.Entities
{
    public class ParabotImageOnlyChannelList
    {
        [BsonId]
        public ulong ServerId { get; set; }
        public List<ulong> ChannelList { get; set; }


        public ParabotImageOnlyChannelList(ulong serverId, List<ulong> channelList)
        {
            ServerId = serverId;
            ChannelList = channelList;
        }
    }
}

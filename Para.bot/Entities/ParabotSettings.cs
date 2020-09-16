using MongoDB.Bson.Serialization.Attributes;

using System.Collections.Generic;

namespace Para.bot.Entities
{
    public class ParabotSettings
    {
        [BsonId]
        public string SettingsType { get; set; }
        public Dictionary<string, object> Settings { get; set; }

        public ParabotSettings(string settingsType, Dictionary<string, object> settings)
        {
            this.SettingsType = settingsType;
            this.Settings = settings; 
        }
    }
}

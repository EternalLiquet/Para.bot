using MongoDB.Bson.Serialization.Attributes;

using System.Collections.Generic;

namespace Para.bot.Entities
{
    public class ParabotSettings
    {
        [BsonId]
        public string SettingsType { get; set; }
        public Dictionary<string, string> Settings { get; set; }

        public ParabotSettings(string settingsType, Dictionary<string, string> settings)
        {
            this.SettingsType = settingsType;
            this.Settings = settings; 
        }
    }
}

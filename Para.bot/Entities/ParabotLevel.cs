using MongoDB.Bson.Serialization.Attributes;

namespace Para.bot.Entities
{
    public class ParabotLevel
    {
        
        [BsonId]
        public int Level { get; set; }
        public int ExpRequirement { get; set; }

        public ParabotLevel(int level, int expRequirement)
        {
            this.Level = level;
            this.ExpRequirement = expRequirement;
        }
    }
}

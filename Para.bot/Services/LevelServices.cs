using Discord.WebSocket;
using Para.bot.Entities;
using Para.bot.Repository;

using Serilog;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace Para.bot.Services
{
    public class LevelServices
    {
        public LevelServices()
        {
            EnsureLevelCollectionExists();
        }

        public async Task HandleMessage(SocketMessage messageEvent)
        {
            var discordMessage = messageEvent as SocketUserMessage;
            if (MessageIsSystemMessage(discordMessage) || discordMessage.Channel == null || discordMessage.Author.IsBot)
                return; //Return and ignore if the message is a discord system message, if the message is not from a guild, or if the author of the message is a bot
            var discordMessageChannel = messageEvent.Channel as SocketTextChannel;

            Log.Information(discordMessage.CreatedAt.ToString());
            Log.Information(discordMessage.Timestamp.ToString());
            Log.Information(discordMessage.Timestamp.ToUnixTimeMilliseconds().ToString()); //This one seems to be the right one
        }

        private async void EnsureLevelCollectionExists()
        {
            LevelRepository levelRepo = new LevelRepository();
            if (await levelRepo.CheckIfExpRequirementsCollectionExists()) return;
            Log.Information("Creating Parabot Level Exp Requirements Collection");
            var levelList = CreateListOfParabotLevelsAndThresholds();
            await levelRepo.CreateLevelCollection(levelList);
        }

        private List<ParabotLevel> CreateListOfParabotLevelsAndThresholds()
        {
            int[] expThresholds = new int[] { 2, 3, 4, 8, 15, 20, 25, 30, 35, 40, 50 };
            List<ParabotLevel> levelList = new List<ParabotLevel>();
            int i = 1;
            foreach (var threshold in expThresholds) 
            {
                levelList.Add(new ParabotLevel(i, threshold));
                i++;
            }
            return levelList;
        }

        internal bool MessageIsSystemMessage(SocketUserMessage discordMessage)
        {
            if (discordMessage == null)
                return true;
            else
                return false;
        }
    }
}

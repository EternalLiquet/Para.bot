using Discord.WebSocket;

using Para.bot.Entities;
using Para.bot.Repository;

using Serilog;

using System;
using System.Collections.Generic;
using System.Linq;
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
            var discordMessageChannel = messageEvent.Channel as SocketTextChannel;
            if (MessageIsSystemMessage(discordMessage) || discordMessageChannel == null || discordMessage.Author.IsBot)
                return; //Return and ignore if the message is a discord system message, if the message is not from a guild, or if the author of the message is a bot

            var levelRepo = new LevelRepository(messageEvent);
            var userList = await levelRepo.ReturnUserByParabotUserId();
            if (userList == null) return;
            switch (userList.Count)
            {
                case 0:
                    Log.Information($"User {messageEvent.Author} not found");
                    await CreateNewParabotUserAsync(messageEvent, levelRepo);
                    break;
                default:
                    Log.Information($"User {messageEvent.Author} found");
                    var parabotUser = await ProcessExp(messageEvent, userList.First());
                    await levelRepo.UpdateParabotUser(parabotUser);
                    break;
            }
            Log.Information(discordMessage.Timestamp.ToUnixTimeMilliseconds().ToString()); //This one seems to be the right one
        }

        private async Task CreateNewParabotUserAsync(SocketMessage messageEvent, LevelRepository levelRepo)
        {
            Log.Information($"Creating new Parabot User for {messageEvent.Author}");
            await levelRepo.InsertNewUser(new ParabotUser(messageEvent));
        }

        private async Task<ParabotUser> ProcessExp(SocketMessage discordMessage, ParabotUser parabotUser)
        {
            Log.Information($"Entered increment exp method for user: {parabotUser}");
            if (IsOnCooldown(discordMessage, parabotUser)) 
                return parabotUser;
            try
            {
                Log.Information($"User {parabotUser.UserName} is not on cooldown");
                parabotUser.GiveExp(1);
                parabotUser.ResetCooldown(discordMessage.Timestamp.ToUnixTimeMilliseconds());
                if (await CheckLevelUpEligibility(parabotUser))
                    parabotUser = await ProcessLevelUp(discordMessage, parabotUser);
                return parabotUser;
            }
            catch (Exception e)
            {
                Log.Error(e.ToString());
                return null;
            }
        }

        private static async Task<ParabotUser> ProcessLevelUp(SocketMessage discordMessage, ParabotUser parabotUser)
        {
            parabotUser.LevelUp();
            try
            {
                await discordMessage.Channel.SendMessageAsync($"Congratulations {parabotUser.UserName}, you have reached level {parabotUser.Level}");
            }
            catch (Exception e)
            {
                var dmChannel = await discordMessage.Author.GetOrCreateDMChannelAsync();
                await dmChannel.SendMessageAsync($"Congratulations {parabotUser.UserName}, you have reached level {parabotUser.Level} in {parabotUser.ServerName}");
                Log.Error(e.ToString());
            }
            return parabotUser;
        }

        private async Task<bool> CheckLevelUpEligibility(ParabotUser parabotUser)
        {
            LevelRepository levelRepo = new LevelRepository();
            var levelList = await levelRepo.GetExpRequirements();
            var levelUpRequirements = levelList.FirstOrDefault(l => l.Level == parabotUser.Level + 1);
            if (levelUpRequirements == null)
                levelUpRequirements = new ParabotLevel(parabotUser.Level + 1, 50);
            Log.Debug($"Level {parabotUser.Level} user {parabotUser.UserName} with {parabotUser.Exp} experience requires {levelUpRequirements.ExpRequirement} experience to level up to {levelUpRequirements.Level}");
            return parabotUser.Exp >= levelUpRequirements.ExpRequirement ? true : false;
        }

        private bool IsOnCooldown(SocketMessage discordMessage, ParabotUser parabotUser)
        {
            //long fiveMinutesInMilliseconds = 1800000;
            long fiveMinutesInMilliseconds = 5000;
            var diffInMilliseconds = discordMessage.Timestamp.ToUnixTimeMilliseconds() - parabotUser.CooldownDTM;
            return diffInMilliseconds <= fiveMinutesInMilliseconds ? true : false;
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

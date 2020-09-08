using Discord.Commands;
using Discord.WebSocket;
using Para.bot.Entities;
using Para.bot.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Para.bot.Services
{
    public class SettingsService
    {
        public async Task SaveGreetingSettings(SocketCommandContext context, string greetingMessage, string whereToGreet, string channelToGreet)
        {
            var guildChannel = context.Channel as SocketTextChannel;
            Dictionary<string, string> settings = new Dictionary<string, string>();
            settings.Add("welcomeMessage", greetingMessage);
            settings.Add("whereToGreet", whereToGreet);
            settings.Add("channelToGreet", channelToGreet);
            ParabotSettings newGreetingSettings = new ParabotSettings($"{guildChannel.Guild.Id}NewMemberSettings", settings);
            SettingsRepository settingsRepo = new SettingsRepository();
            var settingsList = await settingsRepo.GetGreetingSettings(guildChannel.Guild);
            switch (settingsList.Count)
            {
                case 0:
                    await settingsRepo.InsertNewSettings(newGreetingSettings);
                    break;
                default:
                    await settingsRepo.ReplaceSettings(newGreetingSettings);
                    break;
            }
            
        }

        public async Task<ParabotSettings> GetGreetingSettings(SocketUser user)
        {
            var guild = (user as SocketGuildUser).Guild;
            SettingsRepository settingsRepo = new SettingsRepository();
            var settingsList = await settingsRepo.GetGreetingSettings(guild);
            ParabotSettings settings;
            switch (settingsList.Count)
            {
                case 0:
                    settings = new ParabotSettings("", new Dictionary<string, string>());
                    break;
                default:
                    settings = settingsList.FirstOrDefault();
                    break;
            }
            return settings;
        }
    }
}

using Discord.Commands;
using Discord.WebSocket;
using Para.bot.Entities;
using Para.bot.Repository;
using System;
using System.Collections.Generic;
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
            await settingsRepo.InsertNewSettings(newGreetingSettings);
        }
    }
}

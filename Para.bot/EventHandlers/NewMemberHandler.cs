using Discord.WebSocket;
using Para.bot.Services;
using Para.bot.Util;
using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Para.bot.EventHandlers
{
    public class NewMemberHandler
    {
        private readonly DiscordSocketClient _discordClient;

        public NewMemberHandler(DiscordSocketClient client)
        {
            this._discordClient = client;
        }

        public void InitializeNewMemberHandler()
        {
            _ = Task.Factory.StartNew(() => { HandleNewMember(); });
        }

        private void HandleNewMember()
        {
            Log.Information("Initializing New Member Handler");
            _discordClient.UserJoined += async (newUser) =>
            {
                SettingsService settingsService = new SettingsService();
                var settings = await settingsService.GetGreetingSettings(newUser);
                var welcomeMessage = (settings.Settings["welcomeMessage"] == null) ? "Welcome to the server p!username!" : settings.Settings["welcomeMessage"];
                var channelOrDm = (settings.Settings["whereToGreet"] == null) ? "channel" : settings.Settings["whereToGreet"];
                var channelToGreet = (settings.Settings["channelToGreet"] == null) ? "FirstOrDefault" : settings.Settings["channelToGreet"];
                var formattedWelcomeMessage = welcomeMessage.Replace("p!username", newUser.Username).Replace("p!servername", newUser.Guild.Name);
                switch (channelOrDm.ToLower())
                {
                    case "channel":
                        await WelcomeInChannel(newUser, formattedWelcomeMessage, channelOrDm, channelToGreet);
                        break;
                    case "dm":
                        await WelcomeInMessage(newUser, formattedWelcomeMessage);
                        break;
                }
            };
            _discordClient.UserJoined += LogHandler.LogNewMember;
        }

        private async Task WelcomeInMessage(SocketGuildUser newUser, string welcomeMessage)
        {
            var newUserDm = await newUser.GetOrCreateDMChannelAsync();
            await newUserDm.SendMessageAsync(welcomeMessage);
        }

        private async Task WelcomeInChannel(SocketGuildUser newUser, string welcomeMessage, string channelOrDm, string channelToGreet)
        {
            if (channelToGreet == "FirstOrDefault")
            {
                await (newUser.Guild.DefaultChannel).SendMessageAsync(welcomeMessage);
            }
            else
            {
                var channel = newUser.Guild.Channels.FirstOrDefault(ch => ch.Id.ToString() == channelToGreet) as SocketTextChannel;
                await channel.SendMessageAsync(welcomeMessage);
            }
        }
    }
}

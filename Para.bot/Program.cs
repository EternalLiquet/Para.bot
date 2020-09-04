using Discord;
using Discord.Commands;
using Discord.WebSocket;

using Para.bot.Util;
using Para.bot.EventHandlers;

using Serilog;

using System.IO;
using System.Net;
using System.Threading.Tasks;
//using Para.bot.Services;
using System;

namespace Para.bot
{
    class Program
    {
        private DiscordSocketClient _discordClient;

        static void Main(string[] args)
            => new Program().StartAsync().GetAwaiter().GetResult();

        public async Task StartAsync()
        {
            Support.StartupOperations();
            await LogIntoDiscord();
            await InitializeEventHandlers();
            _discordClient.Log += LogHandler.LogMessages;
            await Task.Delay(-1);
        }

        private async Task InitializeEventHandlers()
        {
            Log.Information("Initializing Event Handlers");
            MessageHandler messageHandler = new MessageHandler(_discordClient);
            await messageHandler.InitializeMessageDependentServices();
        }

        private async Task LogIntoDiscord()
        {
            CreateNewDiscordSocketClientWithConfigurations();
            bool loggedIn = false;
            while (loggedIn == false)
            {
                try
                {
                    await _discordClient.LoginAsync(TokenType.Bot, AppSettings.Settings["botToken"]);
                    await _discordClient.StartAsync();
                    await _discordClient.SetGameAsync("For a list of my commands, type ~> help", null, ActivityType.Playing);
                    _discordClient.Ready += () =>
                    {
                        Log.Information("Para.bot successfully connected");
                        return Task.CompletedTask;
                    };
                    loggedIn = true;
                }
                catch (Discord.Net.HttpException e)
                {
                    Log.Error(e.ToString());
                    Log.Error($"Bot Token was incorrect, please review the settings file in {Path.GetFullPath(AppSettings.settingsFilePath)}");
                    if (e.HttpCode == HttpStatusCode.Unauthorized)
                    {
                        AppSettings.FixToken();
                    }
                }
            }
        }

        private void CreateNewDiscordSocketClientWithConfigurations()
        {
            _discordClient = new DiscordSocketClient(new DiscordSocketConfig
            {
                LogLevel = LogSeverity.Verbose,
                MessageCacheSize = 50
            });
        }
    }
}

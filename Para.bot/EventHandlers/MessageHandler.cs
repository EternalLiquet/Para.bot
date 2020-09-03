using Discord.Commands;
using Discord.WebSocket;

using Serilog;
using System;
using System.Reflection;
using System.Threading.Tasks;
using Discord;
//using KawaekoBot.Services;

namespace Para.bot.EventHandlers
{
    public class MessageHandler
    {
        private readonly DiscordSocketClient _discordClient;
        private CommandService _commandService;
        private CommandHandler _commandHandler;
        private UwUCounterService _uwuCounterService;

        public MessageHandler(DiscordSocketClient discordClient)
        {
            Log.Information("Instantiating Message Handler");
            this._discordClient = discordClient;
        }

        public async Task InitializeMessageDependentServices()
        {
            await InstantiateCommandServices();
            InstantiateUwUCountServices();
        }

        private void InstantiateUwUCountServices()
        {
            Log.Information("Instantiating UwU Counting Services");
            _uwuCounterService = new UwUCounterService();
            _discordClient.MessageReceived += _uwuCounterService.HandleMessage;
        }

        private async Task InstantiateCommandServices()
        {
            Log.Information("Instantiating Command Services");
            CreateCommandServiceWithOptions(ref _commandService);
            _commandHandler = new CommandHandler(_discordClient, _commandService);
            await _commandHandler.InitializeCommandsAsync();
        }

        private void CreateCommandServiceWithOptions(ref CommandService _commandService)
        {
            _commandService = new CommandService(new CommandServiceConfig
            {
                LogLevel = LogSeverity.Verbose,
                CaseSensitiveCommands = false
            });
        }
    }
}

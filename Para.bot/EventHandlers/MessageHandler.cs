using Discord;
using Discord.Commands;
using Discord.WebSocket;

using Para.bot.Services;

using Serilog;
using System.Threading.Tasks;


namespace Para.bot.EventHandlers
{
    public class MessageHandler
    {
        private readonly DiscordSocketClient _discordClient;
        private CommandService _commandService;
        private CommandHandler _commandHandler;
        private LevelServices _levelServices;

        public MessageHandler(DiscordSocketClient discordClient)
        {
            Log.Information("Instantiating Message Handler");
            this._discordClient = discordClient;
        }

        public async Task InitializeMessageDependentServices()
        {
            await InstantiateCommandServices();
            await InstantiateLevelServices();
        }

        private Task InstantiateLevelServices()
        {
            Log.Information("Instantiating Level Services");
            _levelServices = new LevelServices();
            _discordClient.MessageReceived += _levelServices.HandleMessage;
            return Task.CompletedTask;
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

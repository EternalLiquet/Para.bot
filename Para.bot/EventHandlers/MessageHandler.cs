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
        private ProfanityFilterService _profanityFilterService;
        private ImageOnlyChannelService _imageOnlyChannelService;

        public MessageHandler(DiscordSocketClient discordClient)
        {
            Log.Information("Instantiating Message Handler");
            this._discordClient = discordClient;
        }

        public async Task InitializeMessageDependentServices()
        {
            _ = Task.Factory.StartNew(async () => { await InstantiateCommandServices(); });
            await InstantiateLevelServices();
            await InstantiateProfanityFilterServices();
            await InstantiateImageOnlyChannelServices();
        }

        private Task InstantiateLevelServices()
        {
            Log.Information("Instantiating Level Services");
            _levelServices = new LevelServices();
            _ = Task.Factory.StartNew(() => { _discordClient.MessageReceived += _levelServices.HandleMessage; });
            return Task.CompletedTask;
        }

        private Task InstantiateProfanityFilterServices()
        {
            Log.Information("Instatiating Profanity Filter Services");
            _profanityFilterService = new ProfanityFilterService();
            _ = Task.Factory.StartNew(() => { _discordClient.MessageReceived += _profanityFilterService.HandleMessage; });
            return Task.CompletedTask;
        }

        private async Task InstantiateCommandServices()
        {
            Log.Information("Instantiating Command Services");
            CreateCommandServiceWithOptions(ref _commandService);
            _commandHandler = new CommandHandler(_discordClient, _commandService);
            await _commandHandler.InitializeCommandsAsync();
        }

        private Task InstantiateImageOnlyChannelServices()
        {
            Log.Information("Instantiating Image Only Channel Services");
            _imageOnlyChannelService = new ImageOnlyChannelService(_discordClient);
            _ = Task.Factory.StartNew(() => { _discordClient.MessageReceived += _imageOnlyChannelService.HandleMessage; });
            return Task.CompletedTask;
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

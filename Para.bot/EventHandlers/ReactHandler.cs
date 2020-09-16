using Discord.WebSocket;
using Para.bot.Services;
using Serilog;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Para.bot.EventHandlers
{
    public class ReactHandler
    {
        private readonly DiscordSocketClient _discordClient;
        private RoleReactService _roleServices;

        public ReactHandler(DiscordSocketClient discordClient)
        {
            Log.Information("Instantiating Message Handler");
            this._discordClient = discordClient;
        }

        public async Task InitializeReactDependentServices()
        {
            await InstantiateRoleServices();
        }

        private Task InstantiateRoleServices()
        {
            Log.Information("Instantiating Role Services");
            _roleServices = new RoleReactService();
            _ = Task.Factory.StartNew(() => { _discordClient.ReactionAdded += _roleServices.HandleReact; });
            return Task.CompletedTask;
        }
    }
}

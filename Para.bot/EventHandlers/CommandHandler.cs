﻿using Discord.Commands;
using Discord.WebSocket;

using Serilog;
using System;
using System.Reflection;
using System.Threading.Tasks;

using Para.bot.Util;

namespace Para.bot.EventHandlers
{
    public class CommandHandler
    {
        private readonly DiscordSocketClient _discordClient;
        private readonly CommandService _commandService;

        public CommandHandler(DiscordSocketClient discordClient, CommandService commandService)
        {
            Log.Information("Instantiating Command Handler");
            this._discordClient = discordClient;
            this._commandService = commandService;
        }

        public async Task InitializeCommandsAsync()
        {
            Log.Information("Installing Commands");
            _discordClient.MessageReceived += HandleCommandAsync;
            _commandService.CommandExecuted += LogHandler.LogCommands;
            await _commandService.AddModulesAsync(assembly: Assembly.GetEntryAssembly(),
                                                  services: null);
        }

        internal async Task HandleCommandAsync(SocketMessage messageEvent)
        {
            var discordMessage = messageEvent as SocketUserMessage;
            if (MessageIsSystemMessage(discordMessage))
                return; //Return and ignore if the message is a discord system message
            int argPos = 0;
            if (!MessageHasCommandPrefix(discordMessage, ref argPos) ||
                messageEvent.Author.IsBot)
                return; //Return and ignore if the discord message does not have the command prefixes or if the author of the message is a bot
            var context = new SocketCommandContext(_discordClient, discordMessage);
            await _commandService.ExecuteAsync(
                context: context,
                argPos: argPos,
                services: null);
        }

        internal bool MessageHasCommandPrefix(SocketUserMessage discordMessage, ref int argPos)
        {
            return (discordMessage.HasStringPrefix("p.", ref argPos, StringComparison.OrdinalIgnoreCase) ||
                            discordMessage.HasMentionPrefix(_discordClient.CurrentUser, ref argPos));
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

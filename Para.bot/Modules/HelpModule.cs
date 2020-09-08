using Discord;
using Discord.Commands;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Para.bot.Modules
{
    [Name("Command Information/Help")]
    public class HelpModule : ModuleBase<SocketCommandContext>
    {
        private readonly CommandService _commandService;

        public HelpModule(CommandService commandService)
        {
            _commandService = commandService;
        }

        [Command("help")]
        [Summary("Lists all the commands that Kawaeko Bot is able to use")]
        [Remarks("help")]
        [RequireBotPermission(ChannelPermission.SendMessages)]
        public async Task HelpCommand()
        {
            string stringPrefix = "p.";

            EmbedBuilder helpBuilder = new EmbedBuilder()
            {
                Title = "Para.Bot Commands",
                Description = $"These are the commands that are available to you\nTo use them, type {stringPrefix} followed by any of the commands below.\n Ex: {stringPrefix}checklevel",
                Color = new Color(218, 112, 214),
                ThumbnailUrl = "https://cdn.discordapp.com/avatars/680785022524981292/978d8e3a9bf9287a68f326d7f6b66d3b.png?size=256"
            };

            foreach (var module in _commandService.Modules)
            {
                string description = null;
                foreach (var command in module.Commands)
                {
                    var result = await command.CheckPreconditionsAsync(Context);
                    if (result.IsSuccess)
                    {
                        description += $"**{command.Aliases.First()}**\n";
                        if (command.Aliases.Count > 1)
                        {
                            description += command.Aliases.Count > 2 ? $"This command can also be used by using the following aliases: \n" : $"This command can also be used by using the following alias: \n";
                            foreach (var alias in command.Aliases)
                            {
                                if (alias != command.Aliases.First())
                                    description += $"\t*{alias}*\n";
                            }
                        }
                        description += $"Function: {command.Summary}\n";
                        description += $"{stringPrefix}{command.Remarks}\n";
                        description += "\n";
                    }
                }

                if (!string.IsNullOrWhiteSpace(description))
                {
                    helpBuilder.AddField(field =>
                    {
                        field.Name = $"**=== {module.Name} ===**";
                        field.Value = description;
                        field.IsInline = false;
                    });
                }
            }

            await ReplyAsync("", false, helpBuilder.Build());
        }
    }
}

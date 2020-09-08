using Discord.Commands;
using Para.bot.Attributes;
using Para.bot.Services;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Para.bot.Modules
{
    [Name("Info Commands")]
    public class InfoModule : ModuleBase<SocketCommandContext>
    {
        [Command("check level")]
        [Summary("Will display what level you are and how much experience you have")]
        [Alias("checklevel")]
        [Remarks("check level")]
        [RequireGuild]
        [RequireBotPermission(ChannelPermission.SendMessages)]
        public async Task CheckLevel()
        {
            await Task.Factory.StartNew(() => { _ = CheckUserLevel(); });
        }

        private async Task CheckUserLevel()
        {
            LevelServices levelServices = new LevelServices();
            var parabotUser = await levelServices.GetParabotUser(Context);
            switch (parabotUser)
            {
                case null:
                    await ReplyAsync($"{Context.Message.Author.Username}, you currently do not have a level!");
                    break;
                default:
                    var levelRequirement = await levelServices.GetLevelRequirement(parabotUser);
                    await ReplyAsync($"{Context.Message.Author.Username}, you are currently level {parabotUser.Level}! You have {parabotUser.Exp}/{(levelRequirement == null ? 50 : levelRequirement.ExpRequirement)} exp to get to the next level");
                    break;
            }
        }
    }
}

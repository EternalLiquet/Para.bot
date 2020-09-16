using Discord;
using Discord.WebSocket;
using Para.bot.Entities;
using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Para.bot.Services
{
    public class RoleReactService
    {
        public async Task HandleReact(Cacheable<IUserMessage, ulong> message, ISocketMessageChannel channel, SocketReaction reaction)
        {
            try
            {
                Log.Information(reaction.ToString());
                var cachedMessage = await message.GetOrDownloadAsync();
                if (cachedMessage.Author.Id == reaction.UserId) return; //If the bot is the one reacting, we ignore
                SettingsService settingsService = new SettingsService();
                var settings = await settingsService.GetRoleSettings(reaction.MessageId.ToString());
                if (settings == null) return;
                List<ParabotRoleEmotePair> roleEmoteDict = (List<ParabotRoleEmotePair>)settings.Settings["roleEmoteDict"];
                var guild = (cachedMessage.Channel as SocketTextChannel).Guild;
                var user = guild.GetUser(reaction.UserId);
                var emojiId = (reaction.Emote as Emote).Id;
                var roleId = roleEmoteDict.Where(entry => entry.emojiId == emojiId.ToString()).FirstOrDefault().roleId;
                var role = guild.Roles.Where(role => role.Id.ToString() == roleId).FirstOrDefault();
                await user.AddRoleAsync(role);
                Log.Information(roleEmoteDict.Count.ToString());
            }
            catch (Exception e)
            {
                Log.Error(e.StackTrace);
                Log.Error(e.Message);
            }
        }
    }
}

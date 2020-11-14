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
                Log.Debug(cachedMessage.Content);
                if (cachedMessage.Author.Id == reaction.UserId) return; //If the bot is the one reacting, we ignore
                SettingsService settingsService = new SettingsService();
                var settings = await settingsService.GetRoleSettings(reaction.MessageId.ToString());
                Log.Debug(settings.ToString());
                if (settings == null) return;
                List<ParabotRoleEmotePair> roleEmoteDict = (List<ParabotRoleEmotePair>)settings.Settings["roleEmoteDict"];
                var guild = (cachedMessage.Channel as SocketTextChannel).Guild;
                Log.Debug(guild.Name);
                var user = guild.GetUser(reaction.UserId);
                Log.Debug(user.Nickname);
                var emojiId = (reaction.Emote as Emote).Id;
                Log.Debug(emojiId.ToString());
                var roleId = roleEmoteDict.Where(entry => entry.emojiId == emojiId.ToString()).FirstOrDefault().roleId;
                var role = guild.Roles.Where(role => role.Id.ToString() == roleId).FirstOrDefault();
                Log.Debug(role.ToString());
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

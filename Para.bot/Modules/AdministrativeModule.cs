using Discord;
using Discord.Commands;
using Discord.Addons.Interactive;

using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Threading;
using System.Linq;
using Discord.WebSocket;
using Para.bot.Services;
using Para.bot.Attributes;
using Para.bot.Entities;

namespace Para.bot.Modules
{
    [Name("Admin Commands")]
    public class AdministrativeModule : InteractiveBase
    {
        [Command("greet setting", RunMode = RunMode.Async)]
        [Summary("Will configure the bot's greeting settings")]
        [Alias("greet settings", "greetsetting", "greetsettings")]
        [Remarks("greet setting")]
        [RequireGuild]
        [RequireUserPermission(GuildPermission.Administrator)]
        public async Task GreetSetting()
        {
            await Task.Factory.StartNew(() => { _ = InvokeGreetSettings(); });
        }

        [Command("role setting", RunMode = RunMode.Async)]
        [Summary("Will create a message for auto-role based on reactions")]
        [Alias("rolesetting", "role settings", "rolesettings")]
        [Remarks("role setting")]
        [RequireGuild]
        [RequireUserPermission(GuildPermission.Administrator)]
        public async Task RoleSetting()
        {
            await Task.Factory.StartNew(() => { _ = InvokeRoleSettingsAsync(); });
        }

        private async Task InvokeRoleSettingsAsync()
        {
            List<IMessage> messagesInInteraction = new List<IMessage>();
            try
            {
                messagesInInteraction.Add(Context.Message);
                List<ParabotRoleEmotePair> roleEmotePair = new List<ParabotRoleEmotePair>();
                messagesInInteraction.Add(await ReplyAsync("How many roles do you wish to configure?"));
                var amountOfRoles = await NextMessageAsync(timeout: TimeSpan.FromSeconds(60));
                if (!await IsNumberOfRolesNotNullAndValid(messagesInInteraction, amountOfRoles)) return;
                for (int i = 0; i < int.Parse(amountOfRoles.Content); i++)
                {
                    messagesInInteraction.Add(await ReplyAsync("Which role would you like to set up?"));
                    var roleToSetup = await NextMessageAsync(timeout: TimeSpan.FromSeconds(60));
                    var roleToAdd = (roleToSetup.Channel as SocketTextChannel).Guild.Roles.FirstOrDefault(role => roleToSetup.Content.Contains(role.Name));
                    if (!await IsRoleNotNullAndValid(messagesInInteraction, roleToSetup, roleToAdd)) return;
                    messagesInInteraction.Add(await ReplyAsync($"Which emote would you like to set up with the role {roleToSetup.Content}"));
                    var emoteToSetup = await NextMessageAsync(timeout: TimeSpan.FromSeconds(60));
                    var emoteToAdd = (emoteToSetup.Channel as SocketTextChannel).Guild.Emotes.FirstOrDefault(emote => emoteToSetup.Content.Contains(emote.Name));
                    if (!await IsEmoteNotNullAndValid(messagesInInteraction, emoteToSetup, emoteToAdd)) return;
                    if (roleEmotePair.Find(role => role.roleId == roleToAdd.Id.ToString()) != null || roleEmotePair.Find(emote => emote.emojiId == emoteToAdd.Id.ToString()) != null)
                    {
                        messagesInInteraction.Add(await ReplyAsync("You seem to have entered a role or emote that is already being setup, please try again"));
                        return;
                    }
                    else
                    {
                        roleEmotePair.Add(new ParabotRoleEmotePair(roleToAdd.Id.ToString(), emoteToAdd.Id.ToString()));
                    }
                }
                messagesInInteraction.Add(await ReplyAsync("Please label this group of roles (i.e Games, Position, NSFW, etc)"));
                var roleGroupLabel = await NextMessageAsync();
                if (!await IsRoleGroupLabelNotNull(messagesInInteraction, roleGroupLabel)) return;
                var messageToListen = await CreateMessageToListen(roleEmotePair, roleGroupLabel.Content);
                SettingsService settingsService = new SettingsService();
                await settingsService.SaveRoleSettings(roleEmotePair, messageToListen);
            }
            finally
            {
                await CleanUpMessagesAfterFiveSeconds(messagesInInteraction);
            }
        }

        private async Task<bool> IsRoleGroupLabelNotNull(List<IMessage> messagesInInteraction, SocketMessage roleGroupLabel)
        {
            if (roleGroupLabel != null)
            {
                messagesInInteraction.Add(roleGroupLabel);
                return true;
            }
            else
            {
                messagesInInteraction.Add(await ReplyAsync("Time has expired, please try again"));
                return false;
            }
        }

        private async Task<IMessage> CreateMessageToListen(List<ParabotRoleEmotePair> roleEmotePair, string roleGroupLabel)
        {
            EmbedBuilder roleEmbed = new EmbedBuilder();
            foreach (var pair in roleEmotePair)
            {
                var emote = Context.Guild.Emotes.FirstOrDefault(emote => emote.Id.ToString() == pair.emojiId);
                roleEmbed.AddField(field =>
                {
                    field.Name = $"{emote}";
                    field.Value = $"<@&{pair.roleId}>";
                    field.IsInline = true;
                });
            }
            roleEmbed.WithFooter(footer => footer.Text = $"Role Group: {roleGroupLabel}");
            var finishedEmbed = roleEmbed.Build();
            var messageToListen = await ReplyAsync(embed: finishedEmbed);
            foreach (var pair in roleEmotePair)
            {
                var emote = Context.Guild.Emotes.FirstOrDefault(emote => emote.Id.ToString() == pair.emojiId);
                await messageToListen.AddReactionAsync(emote);
                Thread.Sleep(2000);
            }
            return messageToListen;
        }

        private async Task<bool> IsEmoteNotNullAndValid(List<IMessage> messagesInInteraction, SocketMessage emoteToSetup, Emote emote)
        {
            if (emoteToSetup != null && emote != null)
            {
                messagesInInteraction.Add(emoteToSetup);
                return true;
            }
            else if (emoteToSetup != null && emote == null)
            {
                messagesInInteraction.Add(await ReplyAsync($"The emote {emoteToSetup.Content} does not exist, please try again"));
                messagesInInteraction.Add(emoteToSetup);
                return false;
            }
            else
            {
                messagesInInteraction.Add(await ReplyAsync("Time has expired, please try again"));
                return false;
            }
        }

        private async Task<bool> IsRoleNotNullAndValid(List<IMessage> messagesInInteraction, SocketMessage roleToSetup, SocketRole role)
        {
            if (roleToSetup != null && role != null)
            {
                messagesInInteraction.Add(roleToSetup);
                return true;
            }
            else if (roleToSetup != null && role == null)
            {
                messagesInInteraction.Add(await ReplyAsync($"The role {roleToSetup.Content} does not exist, please try again"));
                messagesInInteraction.Add(roleToSetup);
                return false;
            }
            else
            {
                messagesInInteraction.Add(await ReplyAsync("Time has expired, please try again"));
                return false;
            }
        }

        private async Task<bool> IsNumberOfRolesNotNullAndValid(List<IMessage> messagesInInteraction, SocketMessage amountOfRoles)
        {
            if (amountOfRoles != null && int.TryParse(amountOfRoles.Content, out _))
            {
                messagesInInteraction.Add(amountOfRoles);
                return true;
            }
            else if (amountOfRoles != null && !int.TryParse(amountOfRoles.Content, out _))
            {
                messagesInInteraction.Add(await ReplyAsync($"{amountOfRoles.Content} is not a number"));
                messagesInInteraction.Add(amountOfRoles);
                return false;
            }
            else
            {
                messagesInInteraction.Add(await ReplyAsync("Time has expired, please try again"));
                return false;
            }
        }

        private async Task InvokeGreetSettings()
        {
            List<IMessage> messagesInInteraction = new List<IMessage>();
            messagesInInteraction.Add(Context.Message);
            messagesInInteraction.Add(await ReplyAsync("Please enter the greeting message you wish to use. If you type p!username, it will replace that with the username of whoever joined. If you type p!servername, it will replace that with the name of the server."));
            var greetingMessage = await NextMessageAsync(timeout: TimeSpan.FromSeconds(60));
            await CheckIfGreetingMessageNull(messagesInInteraction, greetingMessage);
            messagesInInteraction.Add(await ReplyAsync("Do you wish to greet your new members in a text channel or in a direct message? Note: If you choose channel, I will greet users in this channel. [DM]/[Channel]"));
            var channelOrDm = await NextMessageAsync(timeout: TimeSpan.FromSeconds(60));
            await CheckIfChannelOrDmNull(messagesInInteraction, channelOrDm);
            string channelToSend = null;
            channelToSend = processChannelOrDm(channelOrDm, channelToSend);
            await SendConfirmationEmbed(messagesInInteraction, greetingMessage, channelOrDm, channelToSend);
            await CleanUpMessagesAfterFiveSeconds(messagesInInteraction);
            SettingsService settingsService = new SettingsService();
            await settingsService.SaveGreetingSettings(Context, greetingMessage.Content, channelOrDm.Content.ToLower(), channelToSend);
        }

        private async Task CleanUpMessagesAfterFiveSeconds(List<IMessage> messagesInInteraction)
        {
            Thread.Sleep(5000);
            IEnumerable<IMessage> filteredMessages = messagesInInteraction;
            await (Context.Channel as ITextChannel).DeleteMessagesAsync(filteredMessages);
        }

        private async Task SendConfirmationEmbed(List<IMessage> messagesInInteraction, SocketMessage greetingMessage, SocketMessage channelOrDm, string channelToSend)
        {
            EmbedBuilder confirmationEmbed = new EmbedBuilder()
            {
                Title = "Greeting Settings",
                Description = $"Just to confirm, here are the settings I'm saving:\nGreeting Message: {greetingMessage.Content}\nDM Or Channel: {channelOrDm.Content}\nChannel To Send Greetings To: {(channelToSend == null ? "DM" : $"<#{channelToSend}>")}"
            };
            var finishedProduct = confirmationEmbed.Build();
            messagesInInteraction.Add(await ReplyAsync(embed: finishedProduct));
            
        }

        private static string processChannelOrDm(SocketMessage channelOrDm, string channelToSend)
        {
            switch (channelOrDm.Content.ToLower())
            {
                case "channel":
                    channelToSend = channelOrDm.Channel.Id.ToString();
                    break;
                case "dm":
                    channelToSend = null;
                    break;
            }
            return channelToSend;
        }

        private async Task CheckIfChannelOrDmNull(List<IMessage> messagesInInteraction, SocketMessage channelOrDm)
        {
            if (channelOrDm != null && channelOrDm.Content.ToLower() == "dm" || channelOrDm.Content.ToLower() == "channel")
            {
                messagesInInteraction.Add(await ReplyAsync($"The option you have chosen is: {channelOrDm.Content}"));
                messagesInInteraction.Add(channelOrDm);
            }
            else
            {
                messagesInInteraction.Add(await ReplyAsync("Time has expired, please try again"));
                return;
            }
        }

        private async Task CheckIfGreetingMessageNull(List<IMessage> messagesInInteraction, SocketMessage greetingMessage)
        {
            if (greetingMessage != null)
            {
                messagesInInteraction.Add(await ReplyAsync($"The greeting you have chosen to use is: {greetingMessage.Content}"));
                messagesInInteraction.Add(greetingMessage);
            }
            else
            {
                messagesInInteraction.Add(await ReplyAsync("Time has expired, please try again"));
                return;
            }
        }
    }
}

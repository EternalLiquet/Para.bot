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

namespace Para.bot.Modules
{
    [Name("Admin Commands")]
    public class AdministrativeModule : InteractiveBase
    {
        [Command("greet setting", RunMode = RunMode.Async)]
        [Summary("Will configure the bot's greeting settings")]
        [Remarks("greet setting")]
        [RequireGuild]
        [RequireUserPermission(GuildPermission.Administrator)]
        public async Task GreetSetting()
        {
            await Task.Factory.StartNew(() => { _ = InvokeGreetSettings(); });
        }

        private async Task InvokeGreetSettings()
        {
            List<IMessage> messagesInInteraction = new List<IMessage>();
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
            messagesInInteraction.Add(Context.Message);
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

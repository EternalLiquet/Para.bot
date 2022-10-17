using Discord;
using Discord.WebSocket;
using Para.bot.Entities;
using Para.bot.Repository;
using Serilog;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Para.bot.Services
{
    public class ImageOnlyChannelService
    {
        private DiscordSocketClient _discordSocketClient;

        public ImageOnlyChannelService(DiscordSocketClient discordClient)
        {
            this._discordSocketClient = discordClient;
        }

        public ImageOnlyChannelService()
        {
        }

        public async Task HandleMessage(SocketMessage messageEvent)
        {
            ImageOnlyRepository imageOnlyChannelRepo = new ImageOnlyRepository();

            if (messageEvent.Channel is IDMChannel) return;

            var imageOnlyChanneList = await imageOnlyChannelRepo.GetListOfImageOnlyChannels((messageEvent.Channel as SocketTextChannel).Guild.Id);

            if (messageEvent.Author.IsBot ||
                imageOnlyChanneList == null ||
                !imageOnlyChanneList.ChannelList.Contains(messageEvent.Channel.Id)) return;


            var channel = _discordSocketClient.GetChannel(messageEvent.Channel.Id) as ITextChannel;
            var updatedMessage = await channel.GetMessageAsync(messageEvent.Id);



            if (updatedMessage.Embeds.Count == 0 && updatedMessage.Attachments.Count == 0)
            {
                if (updatedMessage.Content.Contains("http"))
                {
                    List<IMessage> messagesInInteraction = new List<IMessage>();
                    messagesInInteraction.Add(await channel.SendMessageAsync("Verifying link contents..."));
                    var testMessage = await channel.SendMessageAsync(updatedMessage.Content);
                    messagesInInteraction.Add(testMessage);
                    if (testMessage.Embeds.Count != 0)
                    {
                        var enumerator = testMessage.Embeds.GetEnumerator();
                        enumerator.MoveNext();
                        if (enumerator.Current.Image == null && enumerator.Current.Video == null)
                        {
                            messagesInInteraction.Add(await channel.SendMessageAsync("Link contains no image or video. Deleting."));
                            await updatedMessage.DeleteAsync();
                        }
                    }
                    await CleanUpMessagesAfterFiveSeconds(messagesInInteraction, channel);
                }
                else
                {
                    await updatedMessage.DeleteAsync();
                }
            }


            if (updatedMessage.Embeds.Count != 0)
            {
                var enumerator = updatedMessage.Embeds.GetEnumerator();
                enumerator.MoveNext();
                if (enumerator.Current.Image == null && enumerator.Current.Video == null)
                {
                    await updatedMessage.DeleteAsync();
                }
            }
        }

        public async Task<bool> ToggleChannelImageOnly(ulong serverId, ulong channelId)
        {
            ImageOnlyRepository imageOnlyChannelRepo = new ImageOnlyRepository();

            var imageOnlyChannelSettings = await imageOnlyChannelRepo.GetListOfImageOnlyChannels(serverId);

            if (imageOnlyChannelSettings == null)
            {
                await imageOnlyChannelRepo.InsertListOfImageOnlyChannels(new ParabotImageOnlyChannelList(serverId, new List<ulong> { channelId }));
                return true;
            }
            else if(imageOnlyChannelSettings.ChannelList.Contains(channelId))
            {
                imageOnlyChannelSettings.ChannelList.Remove(channelId);
                await imageOnlyChannelRepo.UpdateListOfImageOnlyChannels(imageOnlyChannelSettings);
                return false;
            }
            else
            {
                imageOnlyChannelSettings.ChannelList.Add(channelId);
                await imageOnlyChannelRepo.UpdateListOfImageOnlyChannels(imageOnlyChannelSettings);
                return true;
            }
        }

        private async Task CleanUpMessagesAfterFiveSeconds(List<IMessage> messagesInInteraction, ITextChannel channel)
        {
            Thread.Sleep(5000);
            IEnumerable<IMessage> filteredMessages = messagesInInteraction;
            await channel.DeleteMessagesAsync(filteredMessages);
        }
    }
}

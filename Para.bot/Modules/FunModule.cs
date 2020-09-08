using Discord;
using Discord.Commands;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace Para.bot.Modules
{
    [Name("Fun Commands")]
    public class FunModule : ModuleBase<SocketCommandContext>
    {
        private static HttpClient httpClient = new HttpClient();

        [Command("8ball")]
        [Summary("Will predict the future uwu")]
        [Alias("fortune")]
        [Remarks("8ball [question]")]
        [RequireBotPermission(ChannelPermission.SendMessages)]
        public async Task EightBall([Remainder] string question = null)
        {
            await Task.Factory.StartNew(() => { _ = InvokeEightBallApi(question); });
        }

        [Command("meme")]
        [Summary("Will give you a random meme from reddit")]
        [Remarks("meme [subreddit name (Optional)]")]
        [RequireBotPermission(ChannelPermission.SendMessages)]
        public async Task Meme(string subreddit = "")
        {
            await Task.Factory.StartNew(() => { _ = InvokeMemeApi(subreddit); });
        }

        private async Task InvokeMemeApi(string subreddit)
        {
            string uri;
            if (string.IsNullOrEmpty(subreddit)) uri = $"https://meme-api.herokuapp.com/gimme";
            else uri = $"https://meme-api.herokuapp.com/gimme/{HttpUtility.UrlEncode(subreddit)}";
            HttpResponseMessage response = await httpClient.GetAsync(requestUri: uri);
            if (!response.IsSuccessStatusCode) await ReplyAsync("The meme machine is down, quick, call 911!");
            else
            {
                MemeResponse meme = JsonConvert.DeserializeObject<MemeResponse>(await response.Content.ReadAsStringAsync());
                EmbedBuilder memeBuilder = new EmbedBuilder()
                {
                    Title = meme.title,
                    Description = $"/r/{meme.subreddit}",
                    ImageUrl = meme.url
                };
                await ReplyAsync(embed: memeBuilder.Build());
            }
        }

        private async Task InvokeEightBallApi(string question)
        {
            if (string.IsNullOrEmpty(question)) await ReplyAsync("Please ask a question");
            else
            {
                HttpResponseMessage response = await httpClient.GetAsync($"https://8ball.delegator.com/magic/JSON/{HttpUtility.UrlEncode(question)}");
                if (!response.IsSuccessStatusCode) await ReplyAsync("The magic eight ball service is offline, please ask again later (like actually later)");
                else
                {
                    EightBallResponse answer = JsonConvert.DeserializeObject<EightBallResponse>(await response.Content.ReadAsStringAsync());
                    await ReplyAsync(answer.magic["answer"]);
                }
            }
        }
    }
    public class EightBallResponse
    {
        public Dictionary<string, string> magic { get; set; }
    }

    public class MemeResponse
    {
        public string postLink { get; set; }
        public string subreddit { get; set; }
        public string title { get; set; }
        public string url { get; set; }
        public bool nsfw { get; set; }
        public bool spoiler { get; set; }
    }
}

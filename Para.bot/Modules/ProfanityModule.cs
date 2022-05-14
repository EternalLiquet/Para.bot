using Discord;
using Discord.Addons.Interactive;
using Discord.Commands;
using Para.bot.Attributes;
using Para.bot.Services;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Para.bot.Modules
{
    [Name("Profanity Filter Commands")]
    public class ProfanityModule : InteractiveBase
    {
        [Command("profanity add", RunMode = RunMode.Async)]
        [Summary("Will add a word or phrase to the profanity filter list")]
        [Remarks("profanity add <word or phrase>")]
        [RequireGuild]
        [RequireUserPermission(GuildPermission.Administrator)]
        public async Task AddProfanity([Remainder] string profanity)
        {
            await Task.Factory.StartNew(() => { _ = InvokeProfanityAddAsync(profanity); });
        }

        [Command("profanity remove", RunMode = RunMode.Async)]
        [Summary("Will remove a word or phrase from the profanity filter list")]
        [Remarks("profanity remove <word or phrase>")]
        [RequireGuild]
        [RequireUserPermission(GuildPermission.Administrator)]
        public async Task RemoveProfanity([Remainder] string profanity)
        {
            await Task.Factory.StartNew(() => { _ = InvokeProfanityRemoveAsync(profanity); });
        }

        [Command("profanity toggle", RunMode = RunMode.Async)]
        [Summary("Will toggle the profanity filter for the server on or off")]
        [Remarks("profanity toggle")]
        [RequireGuild]
        [RequireUserPermission(GuildPermission.Administrator)]
        public async Task ToggleProfanity()
        {
            await Task.Factory.StartNew(() => { _ = InvokeProfanityToggleAsync(); });
        }

        [Command("profanity settings", RunMode = RunMode.Async)]
        [Summary("Will return the current settings for the profanity filter")]
        [Remarks("profanity settings")]
        [RequireGuild]
        [RequireBotPermission(GuildPermission.EmbedLinks)]
        [RequireUserPermission(GuildPermission.Administrator)]
        public async Task ProfanitySettings()
        {
            await Task.Factory.StartNew(() => { _ = InvokeProfanitySettingsAsync(); });
        }

        [Command("profanity warning toggle", RunMode = RunMode.Async)]
        [Summary("Will toggle the warning message for the profanity filter on or off")]
        [Remarks("profanity warning toggle")]
        [RequireGuild]
        [RequireUserPermission(GuildPermission.Administrator)]
        public async Task WarningMessageToggle()
        {
            await Task.Factory.StartNew(() => { _ = InvokeWarningToggleAsync(); });
        }

        [Command("profanity warning privacy toggle", RunMode = RunMode.Async)]
        [Summary("Will toggle whether or not the user is notified privately or publicly that their message has been deleted")]
        [Remarks("profanity warning toggle")]
        [RequireGuild]
        [RequireUserPermission(GuildPermission.Administrator)]
        public async Task WarningMessagePrivacyToggle()
        {
            await Task.Factory.StartNew(() => { _ = InvokePrivacyToggleAsync(); });
        }

        [Command("profanity warning message set", RunMode = RunMode.Async)]
        [Summary("Set the warning message for the profanity filter. Writing [name] gets replaced with the offender's name, [message] gets replaced with the original message, and [phrase] gets replaced with the offending phrase or word")]
        [Remarks("profanity warning message set <warning message>")]
        [RequireGuild]
        [RequireUserPermission(GuildPermission.Administrator)]
        public async Task WarningMessageSet([Remainder] string warningMessage)
        {
            await Task.Factory.StartNew(() => { _ = InvokeWarningMessageSet(warningMessage); });
        }

        [Command("profanity warning message reset", RunMode = RunMode.Async)]
        [Summary("Set the warning message to default phrase: \"Message deleted, please mind your language\"")]
        [Remarks("profanity warning message reset")]
        [RequireGuild]
        [RequireUserPermission(GuildPermission.Administrator)]
        public async Task WarningMessageReset()
        {
            await Task.Factory.StartNew(() => { _ = InvokeWarningMessageSet("Message deleted, please mind your language"); });
        }

        private async Task InvokeWarningMessageSet(string warningMessage)
        {
            ProfanityFilterService profanityFilterService = new ProfanityFilterService();
            await profanityFilterService.SetWarningMessageAsync(warningMessage, Context.Guild.Id);
            await ReplyAndDeleteAsync("Settings updated");
        }

        private async Task InvokePrivacyToggleAsync()
        {
            ProfanityFilterService profanityFilterService = new ProfanityFilterService();
            var result = await profanityFilterService.ToggleProfanityPrivacyAsync(Context.Guild.Id);
            if (result) await ReplyAsync("Warning will be sent in DM");
            else await ReplyAsync("Warning will be sent in channel");
        }

        private async Task InvokeWarningToggleAsync()
        {
            ProfanityFilterService profanityFilterService = new ProfanityFilterService();
            var result = await profanityFilterService.ToggleProfanityWarningAsync(Context.Guild.Id);
            if (result) await ReplyAsync("Warning message enabled");
            else await ReplyAsync("Warning message disabled");
        }

        private async Task InvokeProfanitySettingsAsync()
        {
            ProfanityFilterService profanityFilterService = new ProfanityFilterService();
            var settings = await profanityFilterService.GetProfanityFilterSettingsAsync(Context.Guild.Id);
            string bannedPhrases = "";
            foreach (string phrase in settings.ProfanityList)
            {
                bannedPhrases += $"{phrase}\n";
            }
            var embed = new EmbedBuilder
            {
                Title = $"Profanity Filter Settings For Guild: {Context.Guild.Name}",
                Description = $"Profanity Enabled: {settings.Enabled}",
                Color = new Color(218, 112, 214),
                ThumbnailUrl = Context.Guild.IconUrl != null ? Context.Guild.IconUrl : "https://cdn.discordapp.com/avatars/680785022524981292/978d8e3a9bf9287a68f326d7f6b66d3b.png?size=256"
            };
            embed.AddField("Profanity List:", bannedPhrases != "" ? bannedPhrases : "You currently have nothing in your profanity list, use the command \"p.profanity add <word or phrase>\" to add to your list");
            embed.AddField("Warning Message: ", settings.WarningMessageEnabled ? "Enabled" : "Disabled");
            embed.AddField("Message: ", settings.WarningMessage == "" ? "No warning message set. Please use `p.profanity swarning message set` to set a new warning message" : settings.WarningMessage);
            embed.AddField("Warning Message Channel:", settings.WarningInDm ? "Direct Message" : "In Channel");
            await ReplyAsync("", false, embed.Build());
        }

        private async Task InvokeProfanityToggleAsync()
        {
            ProfanityFilterService profanityFilterService = new ProfanityFilterService();
            var result = await profanityFilterService.ToggleProfanityFilterAsync(Context.Guild.Id);
            if (result) await ReplyAsync("Profanity filter enabled");
            else await ReplyAsync("Profanity filter disabled");
        }

        private async Task InvokeProfanityRemoveAsync(string profanity)
        {
            ProfanityFilterService profanityFilterService = new ProfanityFilterService();
            await profanityFilterService.RemoveWordFromProfanityFilterAsync(profanity.Trim().ToLower(), Context.Guild.Id);
            await ReplyAndDeleteAsync("Settings updated");
        }

        private async Task InvokeProfanityAddAsync(string profanity)
        {
            ProfanityFilterService profanityFilterService = new ProfanityFilterService();
            await profanityFilterService.AddWordToProfanityFilterAsync(profanity.Trim().ToLower(), Context.Guild.Id);
            await ReplyAndDeleteAsync("Settings updated");
        }
    }
}

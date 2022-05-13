using Discord;
using Discord.WebSocket;
using Para.bot.Entities;
using Para.bot.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Para.bot.Services
{
    public class ProfanityFilterService
    {
        public async Task HandleMessage(SocketMessage messageEvent)
        {
            ProfanityFilterRepository profanityRepo = new ProfanityFilterRepository();
            if (messageEvent.Channel is IDMChannel) return;
            var profanitySettings = await profanityRepo.GetProfanityListAsync((messageEvent.Channel as SocketTextChannel).Guild.Id);
            if (messageEvent.Author.IsBot ||
                profanitySettings == null || 
                profanitySettings.Enabled == false || 
                profanitySettings.ProfanityList.Count == 0 ||
                messageEvent.Content.StartsWith("p.") ||
                profanitySettings.ProfanityList.Any(phraseOrWord => messageEvent.Content.ToLower().Contains(phraseOrWord)) == false) return;

            var wordOrPhraseBanned = profanitySettings.ProfanityList.Find(phraseOrWord => messageEvent.Content.ToLower().Contains(phraseOrWord));

            await messageEvent.DeleteAsync();

            if (profanitySettings.WarningMessageEnabled == false) return;

            profanitySettings.WarningMessage = profanitySettings.WarningMessage.Replace("[name]", messageEvent.Author.Mention).Replace("[message]", messageEvent.Content).Replace("[phrase]", wordOrPhraseBanned);

            if (profanitySettings.WarningInDm)
            {
                var warningChannel = await messageEvent.Author.GetOrCreateDMChannelAsync();
                await warningChannel.SendMessageAsync(profanitySettings.WarningMessage);
            }
            else
            {
                await (messageEvent.Channel as SocketTextChannel).SendMessageAsync(profanitySettings.WarningMessage);
            }
        }

        public async Task AddWordToProfanityFilterAsync(string word, ulong serverId)
        {
            ProfanityFilterRepository profanityRepo = new ProfanityFilterRepository();
            var profanitySettings = await profanityRepo.GetProfanityListAsync(serverId);
            if (profanitySettings == null)
            {
                await profanityRepo.InsertProfanityListAsync(new ParabotProfanityFilterList(serverId, new List<string> { word }, true, true, false, "Please watch your language."));
            }
            else
            {
                if (profanitySettings.ProfanityList.Contains(word)) return;
                profanitySettings.ProfanityList.Add(word);
                await profanityRepo.UpdateProfanityListAsync(profanitySettings);
            }
        }

        public async Task RemoveWordFromProfanityFilterAsync(string word, ulong serverId)
        {
            ProfanityFilterRepository profanityRepo = new ProfanityFilterRepository();
            var profanitySettings = await profanityRepo.GetProfanityListAsync(serverId);
            if (profanitySettings == null) return;
            else
            {
                if (profanitySettings.ProfanityList.Contains(word.Trim().ToLower()))
                {
                    profanitySettings.ProfanityList.Remove(word.Trim().ToLower());
                }
                await profanityRepo.UpdateProfanityListAsync(profanitySettings);
            }
        }

        public async Task<bool> ToggleProfanityFilterAsync(ulong serverId)
        {
            ProfanityFilterRepository profanityRepo = new ProfanityFilterRepository();
            var profanitySettings = await profanityRepo.GetProfanityListAsync(serverId);
            if (profanitySettings == null) return false;
            else 
            {
                profanitySettings.Enabled = !profanitySettings.Enabled;
                await profanityRepo.UpdateProfanityListAsync(profanitySettings);
                return profanitySettings.Enabled;
            }
        }

        public async Task<ParabotProfanityFilterList> GetProfanityFilterSettingsAsync(ulong serverId)
        {
            ProfanityFilterRepository profanityRepo = new ProfanityFilterRepository();
            var result = await profanityRepo.GetProfanityListAsync(serverId);
            if (result == null) return new ParabotProfanityFilterList(serverId, new List<string>(), false, false, false, "");
            else return result;
        }

        public async Task<bool> ToggleProfanityWarningAsync(ulong serverId)
        {
            ProfanityFilterRepository profanityRepo = new ProfanityFilterRepository();
            var profanitySettings = await profanityRepo.GetProfanityListAsync(serverId);
            if (profanitySettings == null) return false;
            else
            {
                profanitySettings.WarningMessageEnabled = !profanitySettings.WarningMessageEnabled;
                await profanityRepo.UpdateProfanityListAsync(profanitySettings);
                return profanitySettings.WarningMessageEnabled;
            }
        }

        public async Task<bool> ToggleProfanityPrivacyAsync(ulong serverId)
        {
            ProfanityFilterRepository profanityRepo = new ProfanityFilterRepository();
            var profanitySettings = await profanityRepo.GetProfanityListAsync(serverId);
            if (profanitySettings == null) return false;
            else
            {
                profanitySettings.WarningInDm = !profanitySettings.WarningInDm;
                await profanityRepo.UpdateProfanityListAsync(profanitySettings);
                return profanitySettings.WarningInDm;
            }
        }

        public async Task SetWarningMessageAsync(string warningMessage, ulong serverId)
        {
            ProfanityFilterRepository profanityRepo = new ProfanityFilterRepository();
            var profanitySettings = await profanityRepo.GetProfanityListAsync(serverId);
            if (profanitySettings == null)
            {
                await profanityRepo.InsertProfanityListAsync(new ParabotProfanityFilterList(serverId, new List<string>(), true, true, false, warningMessage));
            }
            else
            {
                profanitySettings.WarningMessage = warningMessage;
                await profanityRepo.UpdateProfanityListAsync(profanitySettings);
            }
        }
    }
}

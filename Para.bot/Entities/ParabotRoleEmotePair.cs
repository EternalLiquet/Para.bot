using System;
using System.Collections.Generic;
using System.Text;

namespace Para.bot.Entities
{
    public class ParabotRoleEmotePair
    {
        public string roleId { get; set; }
        public string emojiId { get; set; }

        public ParabotRoleEmotePair(string roleId, string emojiId)
        {
            this.roleId = roleId;
            this.emojiId = emojiId;
        }
    }
}

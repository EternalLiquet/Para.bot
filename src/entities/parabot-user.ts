import { id } from 'mongodb-typescript';
import { Message } from 'discord.js';

export class ParabotUser {
    @id ParabotUserId: string;
    UserName: string;
    ServerName: string;
    DiscordId: number;
    ServerId: number;
    CooldownDTM: number;
    Exp: number;
    Level: number;

    fill_user_properties_from_message(message: Message) {
        this.ParabotUserId = message.author.id + message.guild.id;
        this.UserName = message.author.username;
        this.ServerName = message.guild.name;
        this.DiscordId = Number(message.author.id);
        this.ServerId = Number(message.guild.id);
        this.CooldownDTM = message.createdTimestamp;
        this.Exp = 1;
        this.Level = 0;
    }

    give_exp(expToGive: number) {
        this.Exp += expToGive;
    }

    level_up(levelToGive: number) {
        this.Level += levelToGive;
        this.Exp = 0;
    }

    reset_cooldown(newDTM: number) {
        this.CooldownDTM = newDTM;
    }
}

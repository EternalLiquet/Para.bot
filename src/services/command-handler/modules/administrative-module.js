"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_typescript_1 = require("mongodb-typescript");
const inversify_config_1 = require("../../../inversify.config");
const types_1 = require("../../../types");
const parabot_settings_1 = require("../../../entities/parabot-settings");
class AdministratorModule {
    constructor() {
        this.ModuleCommandList = [
            {
                name: 'greet setting',
                description: 'Will configure the bot greeting',
                help_text: `Use this in the channel you want your greeting to appear if you want it in a text channel. If you want it to be sent to a DM, set the channelOrDm setting to true. 
                When configuring the greeting message, use "p.username" to represent someone's username and p.servername to represent the name of the server they joined. 
                For example: If a user named John joined a server named Doe and the greeting message was set to: "Hello, p.username, welcome to p.servername", the bot would instead post: 
                "Hello, John, welcome to Doe"`,
                alias: ['greetsetting', 'welcome setting', 'welcomesetting'],
                required_permission: 'ADMINISTRATOR',
                execute(message, args) {
                    return __awaiter(this, void 0, void 0, function* () {
                        var greetingMessage;
                        var dmOrChannel;
                        var channelToSend;
                        var guildUser = message.guild.members.cache.find(member => member.id == message.author.id);
                        if (guildUser.hasPermission(this.required_permission)) {
                            const dbClient = inversify_config_1.default.get(types_1.TYPES.DbClient);
                            const dbRepo = new mongodb_typescript_1.Repository(parabot_settings_1.ParabotSettings, dbClient.db, "settings");
                            const filter = response => response.author.id == guildUser.id;
                            yield message.reply(`I've recieved your request to configure my settings. Let's start off by configuring your greeting.`);
                            yield message.channel.send(`Please enter the greeting message you wish to use. If you type p.username, it will replace that with the username of whoever joined. If you type p,servername, it will replace that with the name of the server.`);
                            yield message.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] })
                                .then((collected) => __awaiter(this, void 0, void 0, function* () {
                                var reply = collected.first().content;
                                yield message.reply(`The greeting you have chosen to use is... "${reply}"`);
                                greetingMessage = reply;
                            })).catch(() => __awaiter(this, void 0, void 0, function* () {
                                yield message.reply('Time has expired, please try again.');
                            }));
                            yield message.channel.send(`Do you wish to greet your new members in a text channel or in a direct message? Note: If you choose channel, I will greet users in this channel. [DM]/[Channel]`);
                            yield message.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] })
                                .then((collected) => __awaiter(this, void 0, void 0, function* () {
                                var reply = collected.first().content;
                                if (reply.toLowerCase() == "dm" || reply.toLowerCase() == "channel") {
                                    yield message.reply(`The option you have chosen is... "${reply}"`);
                                    dmOrChannel = reply.toLowerCase();
                                }
                                else {
                                    yield message.reply(`I didn't recognize that option, defaulting to channel.`);
                                    dmOrChannel = "channel";
                                }
                            })).catch(() => __awaiter(this, void 0, void 0, function* () {
                                yield message.reply('Time has expired, please try again.');
                            }));
                            if (dmOrChannel == "channel")
                                channelToSend = message.channel.id;
                            yield message.channel.send(`Just to confirm, here are the settings I'm saving:\nGreeting Message: ${greetingMessage}\nDM Or Channel: ${dmOrChannel}\nChannel To Send Greetings To: ${(channelToSend == null ? "DM" : `<#${channelToSend}>`)}`);
                            yield dbRepo.findById("NewMemberSettings").then((result) => __awaiter(this, void 0, void 0, function* () {
                                if (result == null)
                                    yield dbRepo.insert(new parabot_settings_1.ParabotSettings("NewMemberSettings", { "welcomeMessage": greetingMessage, "whereToGreet": dmOrChannel, "channelToGreet": channelToSend }));
                                else
                                    yield dbRepo.update(new parabot_settings_1.ParabotSettings("NewMemberSettings", { "welcomeMessage": greetingMessage, "whereToGreet": dmOrChannel, "channelToGreet": channelToSend }));
                            }));
                        }
                    });
                }
            }
        ];
    }
}
exports.AdministratorModule = AdministratorModule;
//# sourceMappingURL=administrative-module.js.map
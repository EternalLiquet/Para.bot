"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
const discord_js_1 = require("discord.js");
const inversify_1 = require("inversify");
const types_1 = require("./types");
const level_handler_1 = require("./services/level-handler");
const parabot_levels_1 = require("./entities/parabot-levels");
const mongodb_typescript_1 = require("mongodb-typescript");
const inversify_config_1 = require("./inversify.config");
const check_level_1 = require("./services/check-level");
const new_member_handler_1 = require("./services/new-member-handler");
let Bot = class Bot {
    constructor(client, token, GatewayMessageLogger, DatabaseConnectionLogger, levelHandler, levelChecker, newMemberHandler) {
        this.client = client;
        this.token = token;
        this.GatewayMessageLogger = GatewayMessageLogger;
        this.DatabaseConnectionLogger = DatabaseConnectionLogger;
        this.levelHandler = levelHandler;
        this.levelChecker = levelChecker;
        this.newMemberHandler = newMemberHandler;
    }
    listen() {
        this.client.once('ready', () => __awaiter(this, void 0, void 0, function* () {
            const mongoClient = inversify_config_1.default.get(types_1.TYPES.DbClient);
            yield mongoClient.connect();
            var levelRepo = new mongodb_typescript_1.Repository(parabot_levels_1.ParabotLevel, mongoClient.db, "levels");
            this.ensure_exp_requirements_collection_exists(levelRepo).then((result) => {
                this.DatabaseConnectionLogger.info(result);
            });
        }));
        this.client.on('guildMemberAdd', (member) => {
            if (member.user.bot)
                return;
            this.GatewayMessageLogger.debug(`User ${member.user.username} has joined server: ${member.guild.name}`);
            this.newMemberHandler.handle(member);
        });
        this.client.on('ready', () => {
            this.client.user.setActivity("Para.bot is under development, please check back later.", { url: "https://github.com/EternalLiquet/Para.bot", type: "PLAYING" });
        });
        this.client.on('message', (message) => {
            if (message.author.bot)
                return;
            this.GatewayMessageLogger.debug(`User: ${message.author.username}\tServer: ${message.guild != null ? message.guild.name : "In DM Channel"}\tMessageRecieved: ${message.content}\tTimestamp: ${message.createdTimestamp}`);
            if (message.guild != null) {
                /**
                  this.levelHandler.handle(message).then((promise) => {
                    this.GatewayMessageLogger.debug(`Promise handled: ${promise}`);
                  }).catch((error) => {
                    this.GatewayMessageLogger.error(error);
                    process.exit();
                  });
                  this.levelChecker.handle(message).then(() => {
                    this.GatewayMessageLogger.info(`Level info sent to ${message.author}`);
                  }).catch((error) => {
                    if(error != 'Message does not match command'){
                      this.GatewayMessageLogger.error(`Failed to send level info to ${message.author} for reason: ${error}`);
                    }
                  });
                **/
            }
        });
        return this.client.login(this.token);
    }
    ensure_exp_requirements_collection_exists(levelRepo) {
        return __awaiter(this, void 0, void 0, function* () {
            yield levelRepo.count().then((result) => {
                console.log('Count: ', result);
                if (result == null || result == 0) {
                    this.create_exp_threshholds().forEach((expThreshHold) => __awaiter(this, void 0, void 0, function* () {
                        levelRepo.insert(expThreshHold);
                    }));
                }
            });
            return Promise.resolve("Levels database created");
        });
    }
    create_exp_threshholds() {
        var threshHolds = [2, 3, 5, 8, 15, 20, 25, 30, 35, 40, 50];
        var levelArray = [];
        var i = 1;
        threshHolds.forEach(threshHold => {
            levelArray.push(new parabot_levels_1.ParabotLevel(i, threshHold));
            i++;
        });
        return levelArray;
    }
    ;
};
Bot = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.TYPES.Client)),
    __param(1, inversify_1.inject(types_1.TYPES.Token)),
    __param(2, inversify_1.inject(types_1.TYPES.GatewayMessageLogger)),
    __param(3, inversify_1.inject(types_1.TYPES.DatabaseConnectionLogger)),
    __param(4, inversify_1.inject(types_1.TYPES.LevelHandler)),
    __param(5, inversify_1.inject(types_1.TYPES.LevelChecker)),
    __param(6, inversify_1.inject(types_1.TYPES.NewMemberHandler)),
    __metadata("design:paramtypes", [discord_js_1.Client, String, Object, Object, level_handler_1.LevelHandler,
        check_level_1.LevelCheck,
        new_member_handler_1.NewMemberHandler])
], Bot);
exports.Bot = Bot;
let Discord = require('discord.js');
const client = new Discord.Client();
client.on('guildMemberAdd', member => {
    // Send the message to a designated channel on a server:
    const channel = member.guild.channels.cache.find(ch => ch.name === 'member-log');
    // Do nothing if the channel wasn't found on this server
    if (!channel)
        return;
    // Send the message, mentioning the member
    channel.send(`Welcome to the server, ${member}`);
});
// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login('your token here');
//# sourceMappingURL=bot.js.map
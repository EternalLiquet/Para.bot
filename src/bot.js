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
const dbclient_1 = require("./dbclient");
const level_handler_1 = require("./services/level-handler");
const parabot_levels_1 = require("./entities/parabot-levels");
let Bot = class Bot {
    constructor(client, token, GatewayMessageLogger, dbClient, levelHandler) {
        this.client = client;
        this.token = token;
        this.GatewayMessageLogger = GatewayMessageLogger;
        this.dbClient = dbClient;
        this.levelHandler = levelHandler;
    }
    listen() {
        this.client.once('ready', () => {
        });
        this.client.on('ready', () => {
            //this.client.user.setActivity("Para.bot is under development, please check back later.");
            console.log('bot ready event');
        });
        this.client.on('message', (message) => {
            if (message.author.bot)
                return;
            this.GatewayMessageLogger.debug(`User: ${message.author.username}\tServer: ${message.guild != null ? message.guild.name : "In DM Channel"}\tMessageRecieved: ${message.content}\tTimestamp: ${message.createdTimestamp}`);
            if (message.guild != null) {
                this.levelHandler.handle(message).then((promise) => {
                    this.GatewayMessageLogger.debug(`Promise handled: ${promise}`);
                });
            }
        });
        this.client.on('info', (info) => {
        });
        return this.client.login(this.token);
    }
    ensure_exp_requirements_collection_exists(levelRepo) {
        return __awaiter(this, void 0, void 0, function* () {
            levelRepo.count().then((result) => __awaiter(this, void 0, void 0, function* () {
                console.log('Count: ', result);
                if (result == null || result == 0) {
                    this.create_exp_threshholds().forEach((expThreshHold) => __awaiter(this, void 0, void 0, function* () {
                        yield levelRepo.insert(expThreshHold);
                    }));
                }
            }));
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
    __param(3, inversify_1.inject(types_1.TYPES.DbClient)),
    __param(4, inversify_1.inject(types_1.TYPES.LevelHandler)),
    __metadata("design:paramtypes", [discord_js_1.Client, String, Object, dbclient_1.DbClient,
        level_handler_1.LevelHandler])
], Bot);
exports.Bot = Bot;
//# sourceMappingURL=bot.js.map
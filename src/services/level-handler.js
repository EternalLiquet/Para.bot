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
const inversify_1 = require("inversify");
const types_1 = require("../types");
const dbclient_1 = require("../dbclient");
let LevelHandler = class LevelHandler {
    constructor(dbClient) {
        this.dbClient = dbClient;
    }
    handle(message) {
        return __awaiter(this, void 0, void 0, function* () {
            var userId = message.author.id;
            var serverId = message.guild.id;
            var parabotUserId = userId + serverId;
            console.log(userId, serverId, parabotUserId);
            var userFromDb = yield this.dbClient.connect().then(() => __awaiter(this, void 0, void 0, function* () {
                this.dbo = this.dbClient.db.db("parabotdb");
                this.collection = this.dbo.collection("users");
                return yield this.collection.findOne({ ParabotUserId: parabotUserId }).then((result) => {
                    return result;
                });
            }));
            if (userFromDb == null) {
                this.createNewUserInDB(message);
            }
            else {
                this.handleLeveling(message, userFromDb).then((result) => {
                    console.log(result);
                });
            }
            return;
        });
    }
    createNewUserInDB(message) {
        console.log('New user recorded');
        var userId = message.author.id;
        var serverId = message.guild.id;
        var parabotUserId = userId + serverId;
        this.collection.insertOne({ "ParabotUserId": parabotUserId, "UserName": message.author.username, "ServerName": message.guild.name, "LastSentMessageDTM": message.createdTimestamp });
    }
    handleLeveling(message, userFromDb) {
        console.log('User found in DB');
        console.log(userFromDb.ParabotUserId);
        if (this.isOnCooldown(message, userFromDb)) {
            return Promise.resolve("User is on cooldown");
        }
        return Promise.resolve("User is not on cooldown");
    }
    isOnCooldown(message, userFromDb) {
        var fiveMinutesInMilliseconds = 300000;
        var diffInMilliseconds = message.createdTimestamp - Number(userFromDb.LastSentMessageDTM);
        console.log(diffInMilliseconds);
        if (diffInMilliseconds <= fiveMinutesInMilliseconds)
            return true;
        else
            return false;
    }
};
LevelHandler = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.TYPES.DbClient)),
    __metadata("design:paramtypes", [dbclient_1.DbClient])
], LevelHandler);
exports.LevelHandler = LevelHandler;
//# sourceMappingURL=level-handler.js.map
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
const parabot_user_1 = require("../entities/parabot-user");
const mongodb_typescript_1 = require("mongodb-typescript");
let LevelHandler = class LevelHandler {
    constructor(dbClient) {
        this.dbClient = dbClient;
    }
    handle(message) {
        return __awaiter(this, void 0, void 0, function* () {
            var userId = message.author.id;
            var serverId = message.guild.id;
            var parabotUserId = userId + serverId;
            this.dbClient.connect();
            const repo = new mongodb_typescript_1.Repository(parabot_user_1.ParabotUser, this.dbClient.db, "users");
            yield repo.findById(parabotUserId).then((user) => {
                if (user == null) {
                    var newUser = new parabot_user_1.ParabotUser();
                    newUser.fill_user_properties_from_message(message);
                    repo.insert(newUser);
                }
                else {
                    this.handleLeveling(message, user).then((result) => {
                        console.log(result);
                        repo.update(user);
                    }).catch((error) => {
                        console.log(error);
                    });
                }
            });
            /**
            var userFromDb = await this.dbClient.connect().then(async () => {
                this.dbo = this.dbClient.db.db("parabotdb");
                this.collection = this.dbo.collection("users");
                return await this.collection.findOne({ParabotUserId: parabotUserId}).then((result) =>{
                    return result;
                });
            });
            **/
            return;
        });
    }
    handleLeveling(message, userFromDb) {
        console.log(userFromDb.ParabotUserId);
        if (this.isOnCooldown(message, userFromDb)) {
            return Promise.reject(`User ${userFromDb.UserName} is on cooldown in server: ${userFromDb.ServerName}`);
        }
        console.log(userFromDb.Exp);
        userFromDb.give_exp(1);
        userFromDb.reset_cooldown(message.createdTimestamp);
        console.log(userFromDb.Exp);
        return Promise.resolve(userFromDb);
    }
    isOnCooldown(message, userFromDb) {
        var fiveMinutesInMilliseconds = 300000;
        var diffInMilliseconds = message.createdTimestamp - userFromDb.CooldownDTM;
        if (diffInMilliseconds <= fiveMinutesInMilliseconds)
            return true;
        else
            return false;
    }
    addExperienceToUser(user) {
        user.give_exp(1);
    }
};
LevelHandler = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.TYPES.DbClient)),
    __metadata("design:paramtypes", [dbclient_1.DbClient])
], LevelHandler);
exports.LevelHandler = LevelHandler;
//# sourceMappingURL=level-handler.js.map
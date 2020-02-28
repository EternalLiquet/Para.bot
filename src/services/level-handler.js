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
require('dotenv').config();
const inversify_config_1 = require("../inversify.config");
const inversify_1 = require("inversify");
const types_1 = require("../types");
const parabot_user_1 = require("../entities/parabot-user");
const mongodb_typescript_1 = require("mongodb-typescript");
const parabot_levels_1 = require("../entities/parabot-levels");
let LevelHandler = class LevelHandler {
    constructor(serviceLogger) {
        this.serviceLogger = inversify_config_1.default.get(types_1.TYPES.LevelHandlerLogger);
    }
    handle(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const mongoClient = inversify_config_1.default.get(types_1.TYPES.DbClient);
            var parabotUserId = message.author.id + message.guild.id;
            this.serviceLogger.info(`Level Handler entered for user: ${message.author.username} with Parabot User ID: ${parabotUserId}`);
            var userRepo = new mongodb_typescript_1.Repository(parabot_user_1.ParabotUser, mongoClient.db, "users");
            this.serviceLogger.debug(`Level Handler MongoDB Connected`);
            yield userRepo.findById(parabotUserId).then((user) => __awaiter(this, void 0, void 0, function* () {
                this.serviceLogger.info(`DB Search Result for user ${message.author.username}: ${user == null ? "Not Found" : user.UserName}`);
                if (user == null) {
                    var newUser = new parabot_user_1.ParabotUser();
                    newUser.fill_user_properties_from_message(message);
                    yield userRepo.insert(newUser);
                    this.serviceLogger.warn(`${message.author.username} was not found in the database, creating a new Parabot User`);
                }
                else {
                    this.serviceLogger.debug(`${user.UserName} from ${user.ServerName} was found in the database at level ${user.Level} with ${user.Exp} experience`);
                    yield this.handleLeveling(message, user).then((result) => __awaiter(this, void 0, void 0, function* () {
                        this.serviceLogger.debug(`${result.UserName} from ${result.ServerName} is being updated with a level of ${result.Level} with ${result.Exp} experience`);
                        yield userRepo.update(result);
                    })).catch((error) => {
                        this.serviceLogger.error(error);
                    });
                }
            }));
            this.serviceLogger.info(`Level Handling Complete for ${message.author.username}`);
            return Promise.resolve("Level Handler Process Complete");
        });
    }
    handleLeveling(message, userFromDb) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isOnCooldown(message, userFromDb)) {
                return Promise.reject(`User ${userFromDb.UserName} is on cooldown in server: ${userFromDb.ServerName}`);
            }
            userFromDb.give_exp(1);
            userFromDb.reset_cooldown(message.createdTimestamp);
            yield this.checkIfLevelUpEligible(userFromDb).then((eligible) => {
                if (eligible) {
                    userFromDb.level_up(1);
                    message.author.send(`Congratulations, you have reached level ${userFromDb.Level} in the server: ${message.guild.name}\n(Please ignore this message, this is not permanent Bean bot functionality, just need to test something that requires a lot of messages sent to a server LOL. This'll be gone by the end of the day\n-<@114559039731531781>)`).then(() => {
                        this.serviceLogger.info(`User ${userFromDb.UserName} has been notified of level up!`);
                    }).catch((error) => {
                        this.serviceLogger.error(`Something went wrong notifying user ${userFromDb.UserName} of their level: ${error}`);
                    });
                    return userFromDb;
                }
            });
            return Promise.resolve(userFromDb);
        });
    }
    isOnCooldown(message, userFromDb) {
        var fiveMinutesInMilliseconds = 300000;
        var diffInMilliseconds = message.createdTimestamp - userFromDb.CooldownDTM;
        if (diffInMilliseconds <= fiveMinutesInMilliseconds)
            return true;
        else
            return false;
    }
    checkIfLevelUpEligible(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const mongoClient = inversify_config_1.default.get(types_1.TYPES.DbClient);
            var levelRepo = new mongodb_typescript_1.Repository(parabot_levels_1.ParabotLevel, mongoClient.db, "levels");
            var levelRequirements = yield levelRepo.findById(user.Level + 1).then((result) => __awaiter(this, void 0, void 0, function* () {
                return Promise.resolve(result);
            }));
            this.serviceLogger.debug(`${user.UserName} with ${user.Exp} experience requires ${levelRequirements.ExpRequirement} experience to level up`);
            if (user.Exp >= levelRequirements.ExpRequirement) {
                return Promise.resolve(true);
            }
            return Promise.resolve(false);
        });
    }
};
LevelHandler = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.TYPES.LevelHandlerLogger)),
    __metadata("design:paramtypes", [Object])
], LevelHandler);
exports.LevelHandler = LevelHandler;
//# sourceMappingURL=level-handler.js.map
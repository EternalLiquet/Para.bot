"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
const inversify_config_1 = require("../inversify.config");
const inversify_1 = require("inversify");
const types_1 = require("../types");
const mongodb_typescript_1 = require("mongodb-typescript");
const parabot_user_1 = require("../entities/parabot-user");
const parabot_levels_1 = require("../entities/parabot-levels");
let LevelCheck = class LevelCheck {
    handle(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (message.content.trim().toLowerCase() == "p.checklevel") {
                var parabotUserId = message.author.id + message.guild.id;
                var userRepo = new mongodb_typescript_1.Repository(parabot_user_1.ParabotUser, inversify_config_1.default.get(types_1.TYPES.DbClient).db, "users");
                var levelRepo = new mongodb_typescript_1.Repository(parabot_levels_1.ParabotLevel, inversify_config_1.default.get(types_1.TYPES.DbClient).db, "levels");
                yield userRepo.findById(parabotUserId).then((user) => __awaiter(this, void 0, void 0, function* () {
                    if (user == null) {
                        yield message.reply(`${message.author.username} you currently do not have a level!`);
                    }
                    else {
                        yield levelRepo.findById(user.Level + 1).then((levelRequirements) => __awaiter(this, void 0, void 0, function* () {
                            yield message.reply(`${message.author.username} you are currently level ${user.Level}! You have ${user.Exp}/${levelRequirements.ExpRequirement} exp to get to the next level`);
                        }));
                    }
                }));
            }
            return Promise.reject(new Error('Message does not match command'));
        });
    }
};
LevelCheck = __decorate([
    inversify_1.injectable()
], LevelCheck);
exports.LevelCheck = LevelCheck;
//# sourceMappingURL=check-level.js.map
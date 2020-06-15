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
const parabot_user_1 = require("../../../entities/parabot-user");
const parabot_levels_1 = require("../../../entities/parabot-levels");
class LevelModule {
    constructor() {
        this.ModuleCommandList = [
            {
                name: 'checklevel',
                description: 'Will return what level you are',
                help_text: `Use this command to check what level you are and how much experience you have.`,
                alias: 'check level',
                execute(message, args) {
                    return __awaiter(this, void 0, void 0, function* () {
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
                    });
                }
            }
        ];
    }
}
exports.LevelModule = LevelModule;
//# sourceMappingURL=level-module.js.map
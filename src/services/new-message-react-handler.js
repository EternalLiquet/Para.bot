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
const parabot_settings_1 = require("../entities/parabot-settings");
let NewMessageReactHandler = class NewMessageReactHandler {
    handle(messageReact, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const messageReactId = messageReact.emoji.id;
            const guild = messageReact.message.guild;
            const settingsDb = inversify_config_1.default.get(types_1.TYPES.DbClient);
            const settingsRepo = new mongodb_typescript_1.Repository(parabot_settings_1.ParabotSettings, settingsDb.db, "settings");
            const config = yield settingsRepo.findById(`${messageReact.message.guild.id}autorolesettings`);
            if (config == undefined)
                return;
            if (messageReact.message.id != config.Settings['messageToListen'])
                return;
            const roleEmoteDict = config.Settings['roleEmoteDict'];
            console.log(messageReactId);
            var roleId;
            roleEmoteDict.forEach((entry) => __awaiter(this, void 0, void 0, function* () {
                console.log(entry.emojiId);
                if (entry.emojiId == messageReactId) {
                    console.log(true);
                    roleId = entry.roleId;
                }
            }));
            const role = guild.roles.cache.find(role => role.id == roleId);
            const guildUser = guild.members.cache.find(guildUser => guildUser.id == user.id);
            guildUser.roles.add(role);
        });
    }
};
NewMessageReactHandler = __decorate([
    inversify_1.injectable()
], NewMessageReactHandler);
exports.NewMessageReactHandler = NewMessageReactHandler;
//# sourceMappingURL=new-message-react-handler.js.map
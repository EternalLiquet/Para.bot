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
const module_base_1 = require("../../../entities/module-base");
class AdministratorModule extends module_base_1.ModuleBase {
    constructor() {
        super(...arguments);
        this.name = 'greet settings';
        this.description = 'Will configure the bot greeting';
        this.help_text = `Use this in the channel you want your greeting to appear if you want it in a text channel. If you want it to be sent to a DM, set the channelOrDm setting to true. 
    When configuring the greeting message, use "p.username" to represent someone's username and p.servername to represent the name of the server they joined. 
    For example: If a user named John joined a server named Doe and the greeting message was set to: "Hello, p.username, welcome to p.servername", the bot would instead post: 
    "Hello, John, welcome to Doe"`;
        this.alias = null;
    }
    execute(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield message.reply(`I've recieved your request to configure my settings`);
        });
    }
}
exports.AdministratorModule = AdministratorModule;
//# sourceMappingURL=administrative-module.js.map
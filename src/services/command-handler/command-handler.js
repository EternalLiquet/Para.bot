"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const administrative_module_1 = require("./modules/administrative-module");
const level_module_1 = require("./modules/level-module");
const inversify_1 = require("inversify");
const moduleList = [
    administrative_module_1.AdministratorModule,
    level_module_1.LevelModule
];
let CommandHandler = class CommandHandler {
    instantiateCommands() {
        this.commandCollection = new discord_js_1.Collection();
        moduleList.forEach((commandModule) => {
            let command = new commandModule();
            command.ModuleCommandList.forEach((command) => {
                this.commandCollection.set(command.name, command);
            });
        });
        return this.commandCollection;
    }
};
CommandHandler = __decorate([
    inversify_1.injectable()
], CommandHandler);
exports.CommandHandler = CommandHandler;
//# sourceMappingURL=command-handler.js.map
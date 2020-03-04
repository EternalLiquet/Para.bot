"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const administrative_module_1 = require("./modules/administrative-module");
var commandCollection = new discord_js_1.Collection();
var administratorCommands = new administrative_module_1.AdministratorModule();
commandCollection.set(administratorCommands.name, administratorCommands);
exports.CommandList = commandCollection;
//# sourceMappingURL=command-handler.js.map
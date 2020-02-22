"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const inversify_config_1 = require("./inversify.config");
const types_1 = require("./types");
let bot = inversify_config_1.default.get(types_1.TYPES.Bot);
bot.listen().then(() => {
    console.info('Para.bot Connected');
}).catch((error) => {
    console.info('Para.bot cannot connect, reason: ', error);
});
//# sourceMappingURL=index.js.map
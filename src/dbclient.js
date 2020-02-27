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
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const inversify_1 = require("inversify");
const types_1 = require("./types");
let DbClient = class DbClient {
    constructor(dbConnectionString, dbConnectionLogger) {
        this.dbConnectionString = dbConnectionString;
        this.dbConnectionLogger = dbConnectionLogger;
    }
    connect() {
        mongodb_1.MongoClient.connect(this.dbConnectionString).then((db) => {
            this.dbConnectionLogger.info('Successfully Connected to MongoDB');
            this.db = db;
        }).catch((error) => {
            this.dbConnectionLogger.fatal(`Could not connect to MongoDB for reason: ${error}`);
            process.exit();
        });
    }
    exit() {
        this.dbConnectionLogger.info('Closing MongoDB Connection');
        this.db.close();
    }
};
DbClient = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.TYPES.DbConnectionString)),
    __param(1, inversify_1.inject(types_1.TYPES.DatabaseConnectionLogger)),
    __metadata("design:paramtypes", [String, Object])
], DbClient);
exports.DbClient = DbClient;
//# sourceMappingURL=dbclient.js.map
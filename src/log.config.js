"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const typescript_logging_1 = require("typescript-logging");
const maximumLogLevel = process.env.LOGLEVEL;
var logLevel;
switch (maximumLogLevel) {
    case "Trace": {
        logLevel = typescript_logging_1.LogLevel.Trace;
        break;
    }
    case "Debug": {
        logLevel = typescript_logging_1.LogLevel.Debug;
        break;
    }
    case "Info": {
        logLevel = typescript_logging_1.LogLevel.Info;
        break;
    }
    case "Warn": {
        logLevel = typescript_logging_1.LogLevel.Warn;
        break;
    }
    case "Error": {
        logLevel = typescript_logging_1.LogLevel.Error;
        break;
    }
    case "Fatal": {
        logLevel = typescript_logging_1.LogLevel.Fatal;
        break;
    }
    case "Dev": {
        logLevel = typescript_logging_1.LogLevel.Trace;
        break;
    }
    case "Test": {
        logLevel = typescript_logging_1.LogLevel.Info;
        break;
    }
    case "Prod": {
        logLevel = typescript_logging_1.LogLevel.Error;
        break;
    }
}
const options = new typescript_logging_1.LoggerFactoryOptions()
    .addLogGroupRule(new typescript_logging_1.LogGroupRule(new RegExp('GatewayConnection'), logLevel))
    .addLogGroupRule(new typescript_logging_1.LogGroupRule(new RegExp('DatabaseConnection'), logLevel))
    .addLogGroupRule(new typescript_logging_1.LogGroupRule(new RegExp('Service.+'), logLevel))
    .addLogGroupRule(new typescript_logging_1.LogGroupRule(new RegExp('.+'), logLevel));
exports.factory = typescript_logging_1.LFService.createNamedLoggerFactory("LoggerFactory", options);
//# sourceMappingURL=log.config.js.map
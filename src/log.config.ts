require('dotenv').config();
import { LoggerFactoryOptions, LFService, LogGroupRule, LogLevel } from 'typescript-logging'

const maximumLogLevel = process.env.LOGLEVEL;
var logLevel;

switch (maximumLogLevel) {
    case "Trace": {
        logLevel = LogLevel.Trace;
        break;
    }
    case "Debug": {
        logLevel = LogLevel.Debug;
        break;
    }
    case "Info": {
        logLevel = LogLevel.Info;
        break;
    }
    case "Warn": {
        logLevel = LogLevel.Warn;
        break;
    }
    case "Error": {
        logLevel = LogLevel.Error;
        break;
    }
    case "Fatal": {
        logLevel = LogLevel.Fatal;
        break;
    }
    case "Dev": {
        logLevel = LogLevel.Trace;
        break;
    }
    case "Test": {
        logLevel = LogLevel.Info;
        break;
    }
    case "Prod": {
        logLevel = LogLevel.Error;
        break;
    }
}

const options = new LoggerFactoryOptions()
.addLogGroupRule(new LogGroupRule(new RegExp('GatewayConnection'), logLevel))
.addLogGroupRule(new LogGroupRule(new RegExp('DatabaseConnection'), logLevel))
.addLogGroupRule(new LogGroupRule(new RegExp('Service.+'), logLevel))
.addLogGroupRule(new LogGroupRule(new RegExp('.+'), logLevel));

export const factory = LFService.createNamedLoggerFactory("LoggerFactory", options);
import { LoggerFactory, LoggerFactoryOptions, LFService, LogGroupRule, LogLevel } from 'typescript-logging'

const options = new LoggerFactoryOptions()
.addLogGroupRule(new LogGroupRule(new RegExp('Gateway.+'), LogLevel.Debug))
.addLogGroupRule(new LogGroupRule(new RegExp('GatewayConnection'), LogLevel.Info))
.addLogGroupRule(new LogGroupRule(new RegExp('DatabaseConnection'), LogLevel.Info))
.addLogGroupRule(new LogGroupRule(new RegExp('.+'), LogLevel.Info));

export const factory = LFService.createNamedLoggerFactory("LoggerFactory", options);
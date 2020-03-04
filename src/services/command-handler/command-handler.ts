import { Collection } from 'discord.js';
import { ModuleBase } from '../../entities/module-base';
import { AdministratorModule } from './modules/administrative-module';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../types';

const commandCollection = new Collection<string, any>();
const moduleList = [
    AdministratorModule
];

@injectable()
export class CommandHandler{
    instantiateCommands(): Collection<string, any> {
        moduleList.forEach((commandModule) => {
            let command = new commandModule();
            commandCollection.set(command.name, command);
        });
        return commandCollection;
    }
}
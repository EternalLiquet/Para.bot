import { Collection } from 'discord.js';
import { ModuleBase } from '../../entities/module-base';
import { AdministratorModule } from './modules/administrative-module';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../types';

const moduleList = [
    AdministratorModule
];

@injectable()
export class CommandHandler{
    public commandCollection: Collection<string, any>;

    instantiateCommands(): Collection<string, any> {
        this.commandCollection = new Collection<string, any>();
        moduleList.forEach((commandModule) => {
            let command = new commandModule();
            command.ModuleCommandList.forEach((command) => {
                this.commandCollection.set(command.name, command);
            });
        });
        return this.commandCollection;
    }
}
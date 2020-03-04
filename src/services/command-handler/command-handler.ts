import { Collection } from 'discord.js';
import { ModuleBase } from '../../entities/module-base';
import { AdministratorModule } from './modules/administrative-module';


var commandCollection: Collection<string, ModuleBase> = new Collection<string, ModuleBase>();

var administratorCommands = new AdministratorModule();

commandCollection.set(administratorCommands.name, administratorCommands);

export const CommandList: Collection<string, any> = commandCollection;
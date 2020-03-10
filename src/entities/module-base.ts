import { Message } from 'discord.js';
export interface ModuleBase {
    name: string;
    alias: string;
    description: string;
    help_text: string;
    execute(message: Message, args: string): Promise<any>;
}
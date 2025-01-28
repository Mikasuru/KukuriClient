import { Client } from 'discord.js-selfbot-v13';
import { CommandHandler } from '../modules/CommandHandler';

declare module 'discord.js-selfbot-v13' {
    interface Client {
        commandHandler?: CommandHandler;
    }
}
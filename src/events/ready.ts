import { Client } from 'discord.js-selfbot-v13';
import { Event } from '@modules/EventHandler';
import Logger from '@modules/Logger';

const readyEvent: Event = {
    name: 'ready',
    once: true,
    execute: async (client: Client) => {
        try {
            Logger.info(`Logged in as ${client.user?.tag}`);
            
            // Set initial presence
            /*await client.user?.setPresence({
                status: 'online'
            });*/
            
        } catch (error) {
            Logger.error(`Error in ready event: ${(error as Error).message}`);
        }
    }
};

export default readyEvent;
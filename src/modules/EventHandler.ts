import { Client, ClientEvents } from 'discord.js-selfbot-v13';
import fs from 'fs/promises';
import path from 'path';
import Logger from './Logger';

export class EventHandler {
    private readonly client: Client;
    private readonly eventsPath: string;

    constructor(client: Client) {
        this.client = client;
        this.eventsPath = path.join(__dirname, '..', 'events');
    }

    public async loadEvents(): Promise<void> {
        try {
            const eventFiles = await fs.readdir(this.eventsPath);
            
            for (const file of eventFiles) {
                if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;

                try {
                    const eventModule = require(path.join(this.eventsPath, file));
                    const event = eventModule.default;

                    if (event.once) {
                        this.client.once(event.name, (...args) => event.execute(...args, this.client));
                    } else {
                        this.client.on(event.name, (...args) => event.execute(...args, this.client));
                    }

                    Logger.info(`Loaded event: ${event.name}`);
                } catch (error) {
                    Logger.error(`Error loading event ${file}: ${(error as Error).message}`);
                }
            }
        } catch (error) {
            Logger.error(`Failed to load events: ${(error as Error).message}`);
        }
    }

    public registerEvent<K extends keyof ClientEvents>(
        eventName: K,
        callback: (...args: ClientEvents[K]) => void,
        once = false
    ): void {
        try {
            if (once) {
                this.client.once(eventName, callback);
            } else {
                this.client.on(eventName, callback);
            }
            Logger.info(`Registered event: ${eventName.toString()}`);
        } catch (error) {
            Logger.error(`Failed to register event ${eventName}: ${(error as Error).message}`);
        }
    }

    public unregisterEvent<K extends keyof ClientEvents>(
        eventName: K,
        callback: (...args: ClientEvents[K]) => void
    ): void {
        try {
            this.client.off(eventName, callback);
            Logger.info(`Unregistered event: ${eventName.toString()}`);
        } catch (error) {
            Logger.error(`Failed to unregister event ${eventName}: ${(error as Error).message}`);
        }
    }
}

// Example event interface
export interface Event {
    name: string;
    once?: boolean;
    execute: (...args: any[]) => Promise<void>;
}
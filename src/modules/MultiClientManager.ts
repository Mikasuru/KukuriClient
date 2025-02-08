import { Client, Message, PartialMessage } from 'discord.js-selfbot-v13';
import { Config, TokenConfig } from '../interfaces';
import { CommandHandler } from './CommandHandler';
import Logger from './Logger';

import MessageStore from './MessageStore';
import { initAutoReactHandler } from '@/commands/utility/autoreact';
import { initRPCHandler } from '@/commands/utility/rpc';

export class MultiClientManager {
    private clients: Map<string, Client>;
    private commandHandlers: Map<string, CommandHandler>;
    private config: Config;
    private hasInitialized: boolean;
    private deletedMessages: Map<string, Map<string, Message[]>>;
    private readonly maxStoredMessages = 10;
    
    constructor(config: Config) {
        this.clients = new Map();
        this.commandHandlers = new Map();
        this.config = config;
        this.hasInitialized = false;
        this.deletedMessages = new Map();
    }

    public getDeletedMessages(ownerId: string, channelId: string): Message[] | undefined {
        const ownerMessages = this.deletedMessages.get(ownerId);
        if (!ownerMessages) return undefined;
        return ownerMessages.get(channelId);
    }

    public async initialize(): Promise<void> {
        if (this.hasInitialized) {
            await this.destroyAll();
        }

        try {
            Logger.info(`Found ${this.config.tokens.length} tokens in config`);

            for (const tokenConfig of this.config.tokens) {
                await this.initializeClient(tokenConfig);
            }

            this.hasInitialized = true;
            Logger.info(`Initialized ${this.clients.size} clients successfully`);
        } catch (error) {
            Logger.error(`Failed to initialize clients: ${(error as Error).message}`);
            throw error;
        }
    }

    private async initializeClient(tokenConfig: TokenConfig): Promise<void> {
        try {
            Logger.info(`Creating client for ${tokenConfig.ownerId}`);

            const client = new Client();

            client.removeAllListeners();

            const commandHandler = new CommandHandler(client, {
                ...this.config,
                tokens: [tokenConfig]
            });

            let isReady = false;

            client.once('ready', async () => {
                if (isReady) return;
                isReady = true;
                
                Logger.info(`Client logged in as ${client.user?.tag}`);
                try {
                    await commandHandler.loadCommands();
                    this.clients.set(tokenConfig.ownerId, client);
                    this.commandHandlers.set(tokenConfig.ownerId, commandHandler);
                } catch (error) {
                    Logger.error(`Failed to load commands: ${(error as Error).message}`);
                }
            });

            client.on('messageCreate', async (message) => {
                if (!isReady) return;
                if (message.author.id !== tokenConfig.ownerId) return;

                try {
                    await commandHandler.handleCommand(message);
                } catch (error) {
                    Logger.error(`Error handling message: ${(error as Error).message}`);
                }
            });

            client.on('messageDelete', (message: Message | PartialMessage) => {
                try {
                    if (message.partial || message.author?.bot) return;
            
                    MessageStore.getInstance().storeMessage(
                        tokenConfig.ownerId,
                        message.channel.id,
                        message as Message
                    );
                } catch (error) {
                    Logger.error(`Error handling deleted message: ${(error as Error).message}`);
                }
            });

            Logger.info(`Attempting to login for ${tokenConfig.ownerId}...`);

            initRPCHandler(client);
            initAutoReactHandler(client, tokenConfig, true);
            
            await client.login(tokenConfig.token);

        } catch (error) {
            Logger.error(`Failed to initialize client: ${(error as Error).message}`);
            throw error;
        }
    }

    public async destroyAll(): Promise<void> {
        for (const [userId, client] of this.clients) {
            try {
                Logger.info(`Destroying client for ${userId}`);
                
                if (client.readyAt) {
                    client.removeAllListeners();
                    await client.destroy();
                }
                
            } catch (error) {
                Logger.error(`Error destroying client: ${(error as Error).message}`);
            }
        }
        this.clients.clear();
        this.commandHandlers.clear();
        this.hasInitialized = false;
        Logger.info('All clients destroyed successfully');
    }

    public getClientByUserId(userId: string): Client | undefined {
        return this.clients.get(userId);
    }

    public getCommandHandlerByUserId(userId: string): CommandHandler | undefined {
        return this.commandHandlers.get(userId);
    }

    public async reload(newConfig: Config): Promise<void> {
        try {
            Logger.info('Reloading clients with new config...');
            this.config = newConfig;
            await this.destroyAll();
            await this.initialize();
            Logger.info('Clients reloaded successfully');
        } catch (error) {
            Logger.error(`Failed to reload clients: ${(error as Error).message}`);
            throw error;
        }
    }
}
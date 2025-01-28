import { Client, ClientOptions, ActivityType, Message } from 'discord.js-selfbot-v13';
import { CommandHandler } from './CommandHandler';
import { Config } from '../interfaces';
import Logger from './Logger';
import { AFKManager } from '../commands/general/afk';

export class ClientManager {
    private readonly client: Client;
    private readonly commandHandler: CommandHandler;
    private readonly config: Config;
    
    constructor(config: Config, options?: ClientOptions) {
        this.config = config;
        this.client = new Client({
            ...options
        });
        this.commandHandler = new CommandHandler(this.client, this.config);
        
        // Attach commandHandler to client for access in commands
        (this.client as any).commandHandler = this.commandHandler;
    }

    public async initialize(): Promise<void> {
        try {
            await this.setupEventListeners();
            await this.commandHandler.loadCommands();
            await this.login();
            
            Logger.info('Client initialized successfully');
        } catch (error) {
            Logger.error(`Failed to initialize client: ${(error as Error).message}`);
            throw error;
        }
    }

    private async setupEventListeners(): Promise<void> {
        // Client Ready Event
        this.client.once('ready', () => {
            Logger.info(`Logged in as ${this.client.user?.tag}`);
        });
    
        this.client.on('messageCreate', async (message: Message) => {
            const afkManager = AFKManager.getInstance();
            if (!afkManager.getIsAfk) return;
            if (message.author.id === this.client.user?.id) return;
    
            const isDM = message.channel.type === 'DM';
            const isMention = message.mentions.users.has(this.client.user?.id || '');
    
            if (isDM || isMention) {
                if (!afkManager.shouldRespond(message.author.id, message.channel.id)) return;

                try {
                    const response = afkManager.formatResponse();
                    await message.reply(`\`\`\`${response}\`\`\``);
                    await afkManager.sendWebhookNotification(message, response);
                } catch (error) {
                    Logger.error(`Failed to send AFK response: ${(error as Error).message}`);
                }
            } else {
                Logger.info('Message is not DM or mention, skipping...');
            }
        });
    
        // Message Event for Commands
        this.client.on('messageCreate', async (message) => {
            try {
                await this.commandHandler.handleCommand(message);
            } catch (error) {
                Logger.error(`Error handling message: ${(error as Error).message}`);
            }
        });
    
        // Error Event
        this.client.on('error', (error) => {
            Logger.error(`Client error: ${error.message}`);
        });
    
        // Warning Event
        this.client.on('warn', (info) => {
            Logger.warning(`Client warning: ${info}`);
        });
    
        // Debug Event (only if debug mode is enabled)
        if (process.env.NODE_ENV === 'development') {
            this.client.on('debug', (info) => {
                Logger.debug(info);
            });
        }
    }

    private async login(): Promise<void> {
        try {
            await this.client.login(this.config.botSettings.token);
        } catch (error) {
            Logger.error(`Failed to login: ${(error as Error).message}`);
            throw error;
        }
    }

    public getClient(): Client {
        return this.client;
    }

    public getCommandHandler(): CommandHandler {
        return this.commandHandler;
    }

    public async destroy(): Promise<void> {
        try {
            await this.client.destroy();
            Logger.info('Client has been destroyed successfully');
        } catch (error) {
            Logger.error(`Error destroying client: ${(error as Error).message}`);
        }
    }
}
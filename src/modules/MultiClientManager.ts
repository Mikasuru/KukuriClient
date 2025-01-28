import { Client } from 'discord.js-selfbot-v13';
import { CommandHandler } from './CommandHandler';
import { Config, TokenConfig } from '../interfaces';
import Logger from './Logger';
import { ConfigMonitor } from './ConfigMonitor';

export class MultiClientManager {
    private clients: Map<string, Client>;
    private commandHandlers: Map<string, CommandHandler>;
    private config: Config;
    private configMonitor: ConfigMonitor | null;
    
    constructor(config: Config) {
        this.clients = new Map();
        this.commandHandlers = new Map();
        this.config = config;
        this.configMonitor = null;
    }

    public async Initialize(): Promise<void> {
        try {
            if (!this.config.tokens || !Array.isArray(this.config.tokens)) {
                throw new Error('No tokens configured');
            }

            for (const tokenConfig of this.config.tokens) {
                await this.ClientInit(tokenConfig);
            }
            
            const firstClient = this.clients.values().next().value;
            if (firstClient) {
                this.configMonitor = ConfigMonitor.getInstance(firstClient);
                this.configMonitor.startMonitoring();
            }
            
            Logger.info(`Initialized ${this.clients.size} clients successfully`);
        } catch (error) {
            Logger.error(`Failed to Initialize clients: ${(error as Error).message}`);
            throw error;
        }
    }

    private async ClientInit(tokenConfig: TokenConfig): Promise<void> {
        try {
            const client = new Client();
            const commandHandler = new CommandHandler(client, {
                ...this.config,
                botSettings: {
                    ...this.config.botSettings,
                    token: tokenConfig.token
                },
                generalSettings: {
                    ...this.config.generalSettings,
                    ownerId: tokenConfig.ownerId
                }
            });
    
            (client as any).commandHandler = commandHandler;
    
            await commandHandler.loadCommands();
            
            client.on('messageCreate', async (message) => {
                try {
                    await commandHandler.handleCommand(message);
                } catch (error) {
                    Logger.error(`Error handling message: ${(error as Error).message}`);
                }
            });
            
            this.clients.set(tokenConfig.token, client);
            this.commandHandlers.set(tokenConfig.token, commandHandler);
            
            await client.login(tokenConfig.token);
            
            Logger.info(`Client Initialized for owner ${tokenConfig.ownerId}`);
        } catch (error) {
            Logger.error(`Failed to Initialize client: ${(error as Error).message}`);
            throw error;
        }
    }

    public async reloadClients(): Promise<void> {
        try {
            if (this.configMonitor) {
                this.configMonitor.stopMonitoring();
            }

            await this.destroy();

            this.clients.clear();
            this.commandHandlers.clear();

            await this.Initialize();
            
            Logger.info('All clients reloaded successfully');
        } catch (error) {
            Logger.error(`Failed to reload clients: ${(error as Error).message}`);
            throw error;
        }
    }

    public getClientByToken(token: string): Client | undefined {
        return this.clients.get(token);
    }

    public getClientByOwner(ownerId: string): Client | undefined {
        for (const [token, client] of this.clients.entries()) {
            const tokenConfig = this.config.tokens.find(t => t.token === token);
            if (tokenConfig && tokenConfig.ownerId === ownerId) {
                return client;
            }
        }
        return undefined;
    }

    public async destroy(): Promise<void> {
        if (this.configMonitor) {
            this.configMonitor.stopMonitoring();
            this.configMonitor = null;
        }

        for (const client of this.clients.values()) {
            await client.destroy();
        }
        
        this.clients.clear();
        this.commandHandlers.clear();
        Logger.info('All clients destroyed successfully');
    }

    public isUserAllowed(userId: string, token: string): boolean {
        const tokenConfig = this.config.tokens.find(t => t.token === token);
        if (!tokenConfig) return false;
        if (userId === tokenConfig.ownerId) return true;
        return tokenConfig.allowedUsers?.includes(userId) || false;
    }
}

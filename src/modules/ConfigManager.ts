import fs from 'fs/promises';
import path from 'path';
import { Config, TokenConfig } from '../interfaces';
import Logger from './Logger';

class ConfigManager {
    private static instance: ConfigManager;
    private config: Config;
    private readonly configPath: string;
    private readonly defaultConfig: Config = {
        tokens: [],
        botSettings: {
            prefix: '.',
            botAdmins: []
        },
        generalSettings: {
            ownerId: '',
            showLoadCommands: true,
            enableNsfw: false,
            enableDelete: true,
            showStartMessage: false
        },
        commandSettings: {
            deleteExecuted: true,
            deleteInTime: true,
            secondToDelete: 7000
        },
        embedSettings: {
            colors: {
                primary: '#7289DA',
                success: '#43B581',
                error: '#F04747',
                warning: '#FAA61A'
            },
            footer: {
                text: 'Kukuri Client',
                iconUrl: null
            }
        },
        notificationSettings: {
            enabled: false,
            webhook: ''
        },
        commands: {}
    };
    private isReloading: boolean = false;

    private constructor() {
        this.configPath = path.join(__dirname, '..', 'config', 'Config.json');
        this.config = this.defaultConfig;
    }

    public static getInstance(): ConfigManager {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }

    public async loadConfig(): Promise<void> {
        if (this.isReloading) return;
        this.isReloading = true;
        try {
            const exists = await this.checkConfigExists();
            
            if (!exists) {
                Logger.info('Config file not found, creating new one...');
                await this.saveConfig();
                return;
            }

            const data = await fs.readFile(this.configPath, 'utf8');
            //Logger.info(`Raw config data: ${data}`); // Debug line
            
            const parsedConfig = JSON.parse(data);
            //Logger.info(`Parsed config: ${JSON.stringify(parsedConfig)}`); // Debug line
            
            if (!parsedConfig.tokens) {
                Logger.warning('No tokens array found in config');
                parsedConfig.tokens = [];
            }

            // Merge with default config
            this.config = {
                ...this.defaultConfig,
                ...parsedConfig,
                // Ensure nested objects are properly merged
                botSettings: {
                    ...this.defaultConfig.botSettings,
                    ...parsedConfig.botSettings
                },
                generalSettings: {
                    ...this.defaultConfig.generalSettings,
                    ...parsedConfig.generalSettings
                },
                commandSettings: {
                    ...this.defaultConfig.commandSettings,
                    ...parsedConfig.commandSettings
                },
                embedSettings: {
                    ...this.defaultConfig.embedSettings,
                    ...parsedConfig.embedSettings
                },
                notificationSettings: {
                    ...this.defaultConfig.notificationSettings,
                    ...parsedConfig.notificationSettings
                }
            };

            Logger.info(`Loaded config with ${this.config.tokens.length} tokens`);
            
            if (this.config.tokens.length > 0) {
                //Logger.info('Token owners:', this.config.tokens.map(t => t.ownerId).join(', '));
            }

        } finally {
            this.isReloading = false;
        }
    }

    public async saveConfig(): Promise<void> {
        try {
            const configDir = path.dirname(this.configPath);
            await fs.mkdir(configDir, { recursive: true });
            
            const configString = JSON.stringify(this.config, null, 2);
            Logger.info(`Saving config: ${configString}`);
            
            await fs.writeFile(this.configPath, configString);
            Logger.info('Config saved successfully');
        } catch (error) {
            Logger.error(`Failed to save config: ${(error as Error).message}`);
            throw error;
        }
    }

    private async checkConfigExists(): Promise<boolean> {
        try {
            await fs.access(this.configPath);
            return true;
        } catch {
            return false;
        }
    }

    public getConfig(): Config {
        return this.config;
    }

    public getTokenConfig(userId: string): TokenConfig | undefined {
        return this.config.tokens.find(t => t.ownerId === userId);
    }

    public async addToken(tokenConfig: TokenConfig): Promise<void> {
        const existingIndex = this.config.tokens.findIndex(t => t.ownerId === tokenConfig.ownerId);
        
        if (existingIndex !== -1) {
            Logger.info(`Updating existing token for user ${tokenConfig.ownerId}`);
            this.config.tokens[existingIndex] = tokenConfig;
        } else {
            Logger.info(`Adding new token for user ${tokenConfig.ownerId}`);
            this.config.tokens.push(tokenConfig);
        }

        await this.saveConfig();
    }

    public async removeToken(userId: string): Promise<boolean> {
        const initialLength = this.config.tokens.length;
        this.config.tokens = this.config.tokens.filter(t => t.ownerId !== userId);
        
        if (this.config.tokens.length !== initialLength) {
            Logger.info(`Removed token for user ${userId}`);
            await this.saveConfig();
            return true;
        }
        Logger.info(`No token found for user ${userId}`);
        return false;
    }
}

export default ConfigManager;
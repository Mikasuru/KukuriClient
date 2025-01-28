import fs from 'fs/promises';
import path from 'path';
import { Config } from '../interfaces';
import Logger from './Logger';

export class ConfigManager {
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
            showLoadCommands: true,
            enableNsfw: false,
            enableDelete: true,
            showStartMessage: false,
            ownerId: ''
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
        try {
            const configExists = await this.checkConfigExists();
            
            if (!configExists) {
                await this.createDefaultConfig();
            }

            const configData = await fs.readFile(this.configPath, 'utf-8');
            this.config = JSON.parse(configData);
            
            // Validate config
            await this.validateConfig();
            
            Logger.info('Configuration loaded successfully');
        } catch (error) {
            Logger.error(`Failed to load config: ${(error as Error).message}`);
            throw error;
        }
    }

    private async validateConfig(): Promise<void> {
        if (!this.config.tokens || !Array.isArray(this.config.tokens) || this.config.tokens.length === 0) {
            throw new Error('No tokens configured in config');
        }

        for (const tokenConfig of this.config.tokens) {
            if (!tokenConfig.token) {
                throw new Error('Missing token in token configuration');
            }
            if (!tokenConfig.ownerId) {
                throw new Error('Missing ownerId in token configuration');
            }
        }

        const requiredSections = [
            'generalSettings',
            'commandSettings',
            'embedSettings',
            'notificationSettings',
            'commands'
        ];

        for (const section of requiredSections) {
            if (!(section in this.config)) {
                Logger.warning(`Missing ${section} in config, using defaults`);
                (this.config as any)[section] = (this.defaultConfig as any)[section];
            }
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

    private async createDefaultConfig(): Promise<void> {
        try {
            const configDir = path.dirname(this.configPath);
            await fs.mkdir(configDir, { recursive: true });
            await this.saveConfig(this.defaultConfig);
            Logger.info('Created default configuration file');
        } catch (error) {
            Logger.error(`Failed to create default config: ${(error as Error).message}`);
            throw error;
        }
    }

    public async saveConfig(newConfig?: Partial<Config>): Promise<void> {
        try {
            if (newConfig) {
                this.config = {
                    ...this.config,
                    ...newConfig
                };
            }

            await fs.writeFile(
                this.configPath,
                JSON.stringify(this.config, null, 2),
                'utf-8'
            );
            
            Logger.info('Configuration saved successfully');
        } catch (error) {
            Logger.error(`Failed to save config: ${(error as Error).message}`);
            throw error;
        }
    }

    public getConfig(): Config {
        return this.config;
    }

    public updateConfig(path: string, value: any): void {
        const keys = path.split('.');
        let current: any = this.config;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!(keys[i] in current)) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
    }

    public async reset(): Promise<void> {
        try {
            await this.saveConfig(this.defaultConfig);
            Logger.info('Configuration reset to defaults');
        } catch (error) {
            Logger.error(`Failed to reset config: ${(error as Error).message}`);
            throw error;
        }
    }
}

export default ConfigManager;
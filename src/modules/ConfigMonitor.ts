import { Client } from 'discord.js-selfbot-v13';
import ConfigManager from './ConfigManager';
import Logger from './Logger';
import { MultiClientManager } from './MultiClientManager';
import { Config } from '../interfaces';
import fs from 'fs';

export class ConfigMonitor {
    private static instance: ConfigMonitor;
    private configManager: ConfigManager;
    private multiClientManager: MultiClientManager;
    private isReloading: boolean;
    private configWatcher: fs.FSWatcher | null;

    private constructor() {
        this.configManager = ConfigManager.getInstance();
        this.multiClientManager = new MultiClientManager(this.configManager.getConfig());
        this.isReloading = false;
        this.configWatcher = null;
    }

    public static getInstance(): ConfigMonitor {
        if (!ConfigMonitor.instance) {
            ConfigMonitor.instance = new ConfigMonitor();
        }
        return ConfigMonitor.instance;
    }

    public async initialize(): Promise<void> {
        try {
            await this.configManager.loadConfig();
            const config = this.configManager.getConfig();
            this.multiClientManager = new MultiClientManager(config);
            await this.multiClientManager.initialize();
            Logger.info('ConfigMonitor initialized successfully');
        } catch (error) {
            Logger.error(`Failed to initialize ConfigMonitor: ${(error as Error).message}`);
            throw error;
        }
    }

    public startMonitoring(): void {
        const configPath = process.cwd() + '/src/config/Config.json';

        if (this.configWatcher) {
            this.configWatcher.close();
        }

        this.configWatcher = fs.watch(configPath, async (eventType) => {
            if (eventType === 'change' && !this.isReloading) {
                await this.handleConfigChange();
            }
        });

        Logger.info('Config monitoring started');
    }

    private async handleConfigChange(): Promise<void> {
        try {
            this.isReloading = true;
            Logger.info('Config change detected, reloading...');

            await this.configManager.loadConfig();
            const newConfig = this.configManager.getConfig();

            const oldClients = this.multiClientManager;

            this.multiClientManager = new MultiClientManager(newConfig);
            await this.multiClientManager.initialize();

            await oldClients.destroyAll();

            Logger.info('Configuration and clients reloaded successfully');
        } catch (error) {
            Logger.error(`Failed to handle config change: ${(error as Error).message}`);
        } finally {
            this.isReloading = false;
        }
    }

    public stopMonitoring(): void {
        if (this.configWatcher) {
            this.configWatcher.close();
            this.configWatcher = null;
            Logger.info('Config monitoring stopped');
        }
    }

    public getMultiClientManager(): MultiClientManager {
        return this.multiClientManager;
    }

    public async forceReload(): Promise<void> {
        await this.handleConfigChange();
    }
}

export default ConfigMonitor;
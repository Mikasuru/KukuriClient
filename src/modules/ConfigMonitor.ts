import { Client } from 'discord.js-selfbot-v13';
import ConfigManager from './ConfigManager';
import Logger from './Logger';

export class ConfigMonitor {
    private static instance: ConfigMonitor;
    private configManager: ConfigManager;
    private monitorInterval: NodeJS.Timeout | null;
    private lastConfigHash: string;
    private client: Client;

    private constructor(client: Client) {
        this.configManager = ConfigManager.getInstance();
        this.monitorInterval = null;
        this.lastConfigHash = '';
        this.client = client;
    }

    public static getInstance(client: Client): ConfigMonitor {
        if (!ConfigMonitor.instance) {
            ConfigMonitor.instance = new ConfigMonitor(client);
        }
        return ConfigMonitor.instance;
    }

    private async checkConfig(): Promise<void> {
        try {
            await this.configManager.loadConfig();
            const currentConfig = this.configManager.getConfig();
            const currentHash = JSON.stringify(currentConfig);

            if (this.lastConfigHash && this.lastConfigHash !== currentHash) {
                Logger.info('Config change detected, applying updates...');
                
                await this.applyConfigChanges(currentConfig);
            }

            this.lastConfigHash = currentHash;
        } catch (error) {
            Logger.error(`Error checking config: ${(error as Error).message}`);
        }
    }

    private async applyConfigChanges(newConfig: any): Promise<void> {
        try {
            if (this.client.user) {
                if (newConfig.presenceSettings?.enabled) {
                    await this.client.user.setPresence({
                        status: newConfig.presenceSettings.status
                    });
                }
            }

            Logger.info('Config changes applied successfully');
        } catch (error) {
            Logger.error(`Error applying config changes: ${(error as Error).message}`);
        }
    }

    public startMonitoring(): void {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
        }

        this.checkConfig().catch(error => {
            Logger.error(`Initial config check failed: ${error.message}`);
        });

        this.monitorInterval = setInterval(() => {
            this.checkConfig().catch(error => {
                Logger.error(`Config check failed: ${error.message}`);
            });
        }, 60000); // 1m

        Logger.info('Config monitoring started');
    }

    public stopMonitoring(): void {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
            Logger.info('Config monitoring stopped');
        }
    }
}

export default ConfigMonitor;
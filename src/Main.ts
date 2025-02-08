import { MultiClientManager } from './modules/MultiClientManager';
import ConfigManager from './modules/ConfigManager';
import Logger from './modules/Logger';
import fs from 'fs';

class SelfbotClient {
    private configManager: ConfigManager;
    private multiClientManager: MultiClientManager | null;
    private configWatcher: fs.FSWatcher | null = null;

    constructor() {
        this.configManager = ConfigManager.getInstance();
        this.multiClientManager = null;
    }

    public async start(): Promise<void> {
        try {
            Logger.info('Starting Selfbot Client...');
            
            await this.configManager.loadConfig();
            const config = this.configManager.getConfig();
            
            this.multiClientManager = new MultiClientManager(config);
            
            await this.multiClientManager.initialize();
            
            this.startConfigWatcher();
            this.setupProcessHandlers();
            
            Logger.info('Selfbot Client started successfully!');
        } catch (error) {
            Logger.error(`Failed to start: ${(error as Error).message}`);
            process.exit(1);
        }
    }

    private startConfigWatcher(): void {
        if (!this.multiClientManager) return;

        const configPath = process.cwd() + '/src/config/Config.json';
        if (this.configWatcher) {
            this.configWatcher.close();
        }

        this.configWatcher = fs.watch(configPath, async (eventType) => {
            if (eventType === 'change') {
                try {
                    // Reload config
                    await this.configManager.loadConfig();
                    const newConfig = this.configManager.getConfig();
                    
                    Logger.info(`Config reloaded with ${newConfig.tokens.length} tokens`);
                    
                    // Reload clients with new config
                    await this.multiClientManager?.reload(newConfig);
                    
                    Logger.info('Configuration reloaded successfully');
                } catch (error) {
                    Logger.error(`Failed to reload config: ${(error as Error).message}`);
                }
            }
        });
    }

    private setupProcessHandlers(): void {
        process.on('SIGINT', async () => {
            await this.shutdown();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            await this.shutdown();
            process.exit(0);
        });

        process.on('uncaughtException', (error) => {
            Logger.error(`Uncaught Exception: ${error.message}`);
            Logger.error(error.stack || 'No stack trace available');
        });

        process.on('unhandledRejection', (reason, promise) => {
            Logger.error(`Unhandled Rejection at: ${promise}`);
            Logger.error(`Reason: ${reason}`);
        });
    }

    private async shutdown(): Promise<void> {
        Logger.info('Shutting down...');
        
        if (this.configWatcher) {
            this.configWatcher.close();
        }
        
        if (this.multiClientManager) {
            await this.multiClientManager.destroyAll();
        }
        Logger.info('Shutdown complete');
    }
}

// Debug line to see what's in process.cwd()
Logger.info(`Current working directory: ${process.cwd()}`);

// Start the application
const client = new SelfbotClient();
client.start().catch((error) => {
    Logger.error(`Failed to start application: ${error.message}`);
    process.exit(1);
});
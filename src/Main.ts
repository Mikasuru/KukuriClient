import { MultiClientManager } from './modules/MultiClientManager';
import ConfigManager from './modules/ConfigManager';
import Logger from './modules/Logger';

async function main(): Promise<void> {
    try {
        Logger.getInstance({ // Initialize logger
            saveToFile: false
        });

        Logger.info('Starting Kukuri Client...');
        
        const configManager = ConfigManager.getInstance(); // Initialize and load configuration
        await configManager.loadConfig();
        const config = configManager.getConfig();

        Logger.info('Configuration loaded successfully');

        const clientManager = new MultiClientManager(config);

        process.on('SIGINT', async () => {
            Logger.info('Received SIGINT. Cleaning up...');
            await clientManager.destroy();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            Logger.info('Received SIGTERM. Cleaning up...');
            await clientManager.destroy();
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

        // Initialize all clients
        await clientManager.Initialize();
        
        Logger.info('Kukuri Client >> Started successfully!');

    } catch (error) {
        Logger.error(`Failed to start application: ${(error as Error).message}`);
        process.exit(1);
    }
}

// Start the application
main().catch((error) => {
    Logger.error(`Critical error: ${error.message}`);
    process.exit(1);
});
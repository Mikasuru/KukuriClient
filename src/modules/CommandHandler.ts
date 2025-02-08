import { Client, Message, Collection } from 'discord.js-selfbot-v13';
import fs from 'fs/promises';
import path from 'path';
import Logger from './Logger';
import { Command, Config } from '../interfaces';

export class CommandHandler {
    private readonly client: Client;
    private readonly commands: Collection<string, Command>;
    private readonly aliases: Collection<string, string>;
    private readonly cooldowns: Collection<string, Collection<string, number>>;
    private readonly config: Config;
    private processingCommands: Set<string>;

    constructor(client: Client, config: Config) {
        this.client = client;
        this.config = config;
        this.commands = new Collection();
        this.aliases = new Collection();
        this.cooldowns = new Collection();
        this.processingCommands = new Set();

        if (!this.client.commandHandler) {
            this.client.commandHandler = this;
        }
    }

    public async loadCommands(baseDir: string = 'src/commands'): Promise<void> {
        try {
            Logger.info('Loading commands...');
            // Clear existing commands
            this.commands.clear();
            this.aliases.clear();
            this.cooldowns.clear();

            const fullPath = path.join(process.cwd(), baseDir);
            Logger.info(`Loading commands from: ${fullPath}`);
            
            await this.loadCommandsRecursive(fullPath);
            Logger.info(`Successfully loaded ${this.commands.size} commands`);
        } catch (error) {
            Logger.error(`Failed to load commands: ${(error as Error).message}`);
            throw error;
        }
    }

    private async loadCommandsRecursive(dir: string): Promise<void> {
        try {
            const items = await fs.readdir(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = await fs.stat(fullPath);

                if (stat.isDirectory()) {
                    await this.loadCommandsRecursive(fullPath);
                } else if (item.endsWith('.ts') || item.endsWith('.js')) {
                    try {
                        //Logger.info(`Loading command file: ${item}`);
                        const commandModule = require(fullPath);
                        const command = commandModule.default as Command;

                        if (this.validateCommand(command)) {
                            this.registerCommand(command);
                            //Logger.info(`Registered command: ${command.name}`);
                        }
                    } catch (error) {
                        Logger.error(`Error loading command ${item}: ${(error as Error).message}`);
                    }
                }
            }
        } catch (error) {
            //Logger.error(`Error in loadCommandsRecursive: ${error.message}`);
            throw error;
        }
    }

    private validateCommand(command: Command): boolean {
        const requiredProps = ['name', 'description', 'category', 'execute'];
        return requiredProps.every(prop => prop in command);
    }

    private registerCommand(command: Command): void {
        this.commands.set(command.name, command);
        
        if (command.aliases) {
            command.aliases.forEach(alias => {
                this.aliases.set(alias, command.name);
            });
        }
    }

    private async executeCommand(command: Command, message: Message, args: string[]): Promise<void> {
        try {
            const botMessage = await command.execute(message, args, this.client);
            await this.handleAutoDelete(message, botMessage);
        } catch (error) {
            Logger.error(`Error executing command ${command.name}: ${(error as Error).message}`);
            const errorMessage = await message.channel.send('```❌ An error occurred while executing the command.```');
            
            if (this.config.commandSettings.deleteInTime) {
                setTimeout(() => {
                    errorMessage.delete().catch(() => {});
                }, this.config.commandSettings.secondToDelete);
            }
            
            throw error;
        }
    }

    public async handleCommand(message: Message): Promise<void> {
        const tokenConfig = this.config.tokens[0];
        if (!tokenConfig) return;

        const prefix = tokenConfig.prefix;
        if (!message.content.startsWith(prefix)) return;
        
        const commandId = `${message.id}-${message.author.id}`;
        
        if (this.processingCommands.has(commandId)) {
            Logger.info(`Command ${commandId} is already being processed`);
            return;
        }

        this.processingCommands.add(commandId);

        try {
            Logger.info(`Received command: ${message.content}`);

            if (message.author.bot) return;
            if (message.author.id !== tokenConfig.ownerId) {
                Logger.info(`Command rejected: User ${message.author.id} is not the owner`);
                return;
            }

            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift()?.toLowerCase();

            if (!commandName) return;

            Logger.info(`Processing command: ${commandName} with args: ${args.join(', ')}`);

            const command = this.commands.get(commandName) || 
                         this.commands.get(this.aliases.get(commandName) || '');

            if (!command) {
                Logger.info(`Command not found: ${commandName}`);
                return;
            }

            try {
                Logger.info(`Executing command: ${command.name}`);
                if (await this.checkCooldown(message, command)) return;
                await this.executeCommand(command, message, args);
                Logger.info(`Command executed successfully: ${command.name}`);
            } catch (error) {
                Logger.error(`Error in command handling: ${(error as Error).message}`);
            }
        } finally {
            this.processingCommands.delete(commandId);
        }
    }

    private async handleAutoDelete(message: Message, botMessage: Message | undefined | void): Promise<void> {
        try {
            const { deleteExecuted, deleteInTime, secondToDelete } = this.config.commandSettings;

            if (deleteExecuted && message.deletable) {
                await message.delete().catch(() => {
                    Logger.warning(`Failed to delete command message: ${message.id}`);
                });
            }

            if (deleteInTime && botMessage && 'deletable' in botMessage && botMessage.deletable) {
                setTimeout(async () => {
                    try {
                        await botMessage.delete();
                    } catch (error) {
                        Logger.warning(`Failed to delete bot message: ${botMessage.id}`);
                    }
                }, secondToDelete);
            }
        } catch (error) {
            Logger.error(`Error in auto-delete system: ${(error as Error).message}`);
        }
    }

    public getCommands(): Collection<string, Command> {
        return this.commands;
    }

    public getCommandsByCategory(): Map<string, Command[]> {
        const categories = new Map<string, Command[]>();
        
        this.commands.forEach(command => {
            if (!categories.has(command.category)) {
                categories.set(command.category, []);
            }
            categories.get(command.category)?.push(command);
        });

        return categories;
    }

    private async checkCooldown(message: Message, command: Command): Promise<boolean> {
        if (!this.cooldowns.has(command.name)) {
            this.cooldowns.set(command.name, new Collection());
        }

        const now = Date.now();
        const timestamps = this.cooldowns.get(command.name)!;
        const cooldownAmount = (command.cooldown || 3) * 1000;

        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id)! + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                await message.reply(
                    `\`\`\`❌ Please wait ${timeLeft.toFixed(1)} more seconds before using the \`${command.name}\` command.\`\`\``
                );
                return true;
            }
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        return false;
    }
}
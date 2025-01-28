import { Message, Client } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';
import { CommandHandler } from '../../modules/CommandHandler';
import Logger from '../../modules/Logger';

const command: Command = {
    name: 'help',
    description: 'Display all commands or info about a specific command',
    category: 'General',
    aliases: ['h', 'commands'],
    cooldown: 3,
    
    async execute(message: Message, args: string[], client: Client): Promise<Message> {
        try {
            const commandHandler = client.commandHandler as CommandHandler;
            if (!commandHandler) {
                throw new Error('CommandHandler not found');
            }

            const commands = commandHandler.getCommands();

            let helpMessage = '```\nKukuri Client Commands\n';
            helpMessage += '═══════════════════\n\n';

            if (args.length > 0) {
                const commandName = args[0].toLowerCase();
                const command = commands.get(commandName) || 
                              Array.from(commands.values()).find(cmd => cmd.aliases?.includes(commandName));

                if (!command) {
                    return message.channel.send('```❌ Command not found```');
                }

                helpMessage += `Command: ${command.name}\n`;
                helpMessage += `${'═'.repeat(command.name.length + 9)}\n\n`;
                helpMessage += `Description: ${command.description}\n`;
                if (command.aliases?.length) {
                    helpMessage += `Aliases: ${command.aliases.join(', ')}\n`;
                }
                if (command.usage) {
                    helpMessage += `Usage: ${command.usage}\n`;
                }
                helpMessage += `Cooldown: ${command.cooldown || 3} seconds\n`;
                helpMessage += `Category: ${command.category}\n`;

            } else {
                const categories = new Map<string, Command[]>();

                commands.forEach(command => {
                    const category = categories.get(command.category) || [];
                    category.push(command);
                    categories.set(command.category, category);
                });

                const sortedCategories = new Map([...categories.entries()].sort());

                for (const [category, cmds] of sortedCategories) {
                    helpMessage += `${category}\n`;
                    helpMessage += `${'-'.repeat(category.length)}\n`;
                    
                    const sortedCommands = cmds.sort((a, b) => a.name.localeCompare(b.name));
                    
                    const commandList = sortedCommands
                        .map(cmd => {
                            const cooldown = cmd.cooldown ? ` (${cmd.cooldown}s)` : '';
                            return `${cmd.name}${cooldown}: ${cmd.description}`;
                        })
                        .join('\n');
                    helpMessage += `${commandList}\n\n`;
                }
                helpMessage += `Tip: Use .help <command> for detailed information about a command`;
            }

            helpMessage += '\n```';
            
            return message.channel.send(helpMessage);

        } catch (error) {
            Logger.error(`Error in help command: ${(error as Error).message}`);
            throw error;
        }
    }
};

export default command;
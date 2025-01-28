import { Message, Client } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';
import Logger from '../../modules/Logger';
import ConfigManager from '../../modules/ConfigManager';
import command from '../general/afk';

// Auth Command
export const authCommand: Command = {
    name: 'auth',
    description: 'Add a user to BotAdmins',
    category: 'System',
    aliases: ['addadmin', 'authorize'],
    cooldown: 0,
    usage: '.auth <@user/id>',

    async execute(message: Message, args: string[], client: Client): Promise<void> {
        const configManager = ConfigManager.getInstance();
        const config = configManager.getConfig();

        if (message.author.id !== config.generalSettings.ownerId) {
            await message.channel.send('```❌ You do not have permission to use this command.```');
            return;
        }

        const userId = args[0]?.replace(/[<@!>]/g, '');
        if (!userId) {
            await message.channel.send('```❌ Please specify a valid user ID or mention.```');
            return;
        }

        if (config.botSettings.botAdmins.includes(userId)) {
            await message.channel.send('```❌ This user is already in BotAdmins.```');
            return;
        }

        // Add user to BotAdmins
        config.botSettings.botAdmins.push(userId);

        try {
            await configManager.saveConfig();
            if (config.generalSettings.showStartMessage) {
                await message.channel.send(`\`\`\`✅ Successfully added <@${userId}> to BotAdmins.\`\`\``);
            }
            Logger.info(`Added user ${userId} to BotAdmins`);
        } catch (error) {
            Logger.error(`Failed to save config: ${(error as Error).message}`);
            await message.channel.send('```❌ Failed to save configuration.```');
        }
    }
};

export default command;
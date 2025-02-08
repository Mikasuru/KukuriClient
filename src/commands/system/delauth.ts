import { Message, Client } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';
import Logger from '../../modules/Logger';
import ConfigManager from '../../modules/ConfigManager';
import command from '../general/afk';

// DelAuth Command
export const delAuthCommand: Command = {
    name: 'delauth',
    description: 'Remove a user from BotAdmins',
    category: 'System',
    aliases: ['removeadmin', 'deauth'],
    cooldown: 0,
    usage: '.delauth <@user/id>',

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

        const adminIndex = config.botSettings.botAdmins.indexOf(userId);
        if (adminIndex === -1) {
            await message.channel.send('```❌ This user is not in BotAdmins.```');
            return;
        }

        // Remove user from BotAdmins
        config.botSettings.botAdmins.splice(adminIndex, 1);

        try {
            await configManager.saveConfig();
            if (config.generalSettings.showStartMessage) {
                await message.channel.send(`\`\`\`✅ Successfully removed <@${userId}> from BotAdmins.\`\`\``);
            }
            Logger.info(`Removed user ${userId} from BotAdmins`);
        } catch (error) {
            Logger.error(`Failed to save config: ${(error as Error).message}`);
            await message.channel.send('```❌ Failed to save configuration.```');
        }
    }
};

export default command;
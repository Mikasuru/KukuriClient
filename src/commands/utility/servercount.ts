import { Message, Client, WebEmbed } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';
import Logger from '../../modules/Logger';

const command: Command = {
    name: 'servercount',
    description: 'Shows how many servers you are in',
    category: 'Utility',
    aliases: ['servers', 'sc'],
    cooldown: 5,
    usage: '.servercount',
    
    async execute(message: Message, args: string[], client: Client): Promise<void> {
        try {
            const guildCount = client.guilds.cache.size;

            const snipeContent = [
                '```ini',
                '[Server Count]',
                `You have ${guildCount} friends`,
                '```'
            ].filter(Boolean).join('\n');

            await message.channel.send(snipeContent);

        } catch (error) {
            Logger.error(`Error in servercount command: ${(error as Error).message}`);
            await message.reply('```❌ An error occurred while counting servers```');
        }
    }
};

export default command;
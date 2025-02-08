import { Message, Client, WebEmbed } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';
import Logger from '../../modules/Logger';

const command: Command = {
    name: 'friendcount',
    description: 'Shows how many friends you have',
    category: 'Utility',
    aliases: ['friends', 'fc'],
    cooldown: 5,
    usage: '.friendcount',
    
    async execute(message: Message, args: string[], client: Client): Promise<void> {
        try {
            const relationships = client.relationships.friendCache;
            const friendCount = relationships.size;
            
            const snipeContent = [
                '```ini',
                '[Friend Count]',
                `You have ${friendCount} friends`,
                '```'
            ].filter(Boolean).join('\n');

            await message.channel.send(snipeContent);

        } catch (error) {
            Logger.error(`Error in friendcount command: ${(error as Error).message}`);
            await message.reply('```❌ An error occurred while counting friends```');
        }
    }
};

export default command;
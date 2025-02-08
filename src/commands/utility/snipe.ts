import { Message, Client } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';
import Logger from '../../modules/Logger';
import MessageStore from '../../modules/MessageStore';

const command: Command = {
    name: 'snipe',
    description: 'Shows recently deleted messages',
    category: 'Utility',
    aliases: ['s'],
    cooldown: 3,
    usage: '.snipe [number]\nExample: .snipe 1',
    
    async execute(message: Message, args: string[], client: Client): Promise<void> {
        try {
            const index = args[0] ? parseInt(args[0]) - 1 : 0;
            
            if (isNaN(index) || index < 0) {
                await message.reply('```❌ Please provide a valid message number```');
                return;
            }

            const deletedMessages = MessageStore.getInstance().getMessages(
                message.author.id,
                message.channel.id
            );
            
            if (deletedMessages.length === 0) {
                await message.reply('```❌ No recently deleted messages found```');
                return;
            }

            if (index >= deletedMessages.length) {
                await message.reply(`\`\`\`❌ Only ${deletedMessages.length} deleted message(s) available\`\`\``);
                return;
            }

            const deletedMessage = deletedMessages[index];
            const timeDelta = Math.floor((Date.now() - deletedMessage.createdTimestamp) / 1000);

            const snipeContent = [
                '```ini',
                `[ Sniped Message #${index + 1} ]`,
                '',
                '[Author]',
                deletedMessage.author?.tag,
                '',
                '[Deleted]',
                `${timeDelta} seconds ago`,
                '',
                '[Content]',
                deletedMessage.content || '*No content*',
                '',
                deletedMessage.attachments.size > 0 ? '[Attachments]\nYes' : '',
                '```'
            ].filter(Boolean).join('\n');

            await message.channel.send(snipeContent);

        } catch (error) {
            Logger.error(`Error in snipe command: ${(error as Error).message}`);
            await message.reply('```❌ An error occurred while sniping message```');
        }
    }
};

export default command;
import { Message, Client, WebEmbed } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';
import Logger from '../../modules/Logger';

const command: Command = {
    name: 'purge',
    description: 'Send empty messages to clear chat view',
    category: 'Moderation',
    aliases: ['prune', 'bulk'],
    cooldown: 5,
    usage: '.purge [amount]\nExample: .purge 50',
    
    async execute(message: Message, args: string[], client: Client): Promise<void> {
        try {
            if (!message.guild) {
                await message.reply('```❌ This command can only be used in a server```');
                return;
            }

            if (!args[0] || isNaN(Number(args[0]))) {
                await message.reply('```❌ Please provide a valid number of messages to purge```');
                return;
            }

            const amount = Math.floor(Number(args[0]));
            if (amount < 1 || amount > 100) {
                await message.reply('```❌ Please provide a number between 1 and 100```');
                return;
            }

            const statusMsg = await message.channel.send(`\`\`\`🔄 Purging ${amount} messages...\`\`\``);

            try {
                // Send empty messages
                for (let i = 0; i < amount; i++) {
                    await message.channel.send('** **');
                    // Small delay to prevent rate limiting
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                const embed = new WebEmbed()
                    .setColor('#00ff00')
                    .setTitle('Purge Complete')
                    .setDescription(`Successfully sent ${amount} empty messages`);

                await statusMsg.edit({ content: `${WebEmbed.hiddenEmbed}${embed}` });

                // Delete status message after 3 seconds
                setTimeout(() => {
                    statusMsg.delete().catch(() => {});
                }, 3000);

            } catch (error) {
                Logger.error(`Error in message sending: ${(error as Error).message}`);
                await statusMsg.edit('```❌ Failed to complete purge operation```');
            }

        } catch (error) {
            Logger.error(`Error in purge command: ${(error as Error).message}`);
            await message.reply('```❌ An error occurred while purging messages```');
        }
    }
};

export default command;
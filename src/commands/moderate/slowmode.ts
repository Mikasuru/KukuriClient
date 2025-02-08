import { Message, Client, TextChannel, WebEmbed } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';
import Logger from '../../modules/Logger';

const command: Command = {
    name: 'slowmode',
    description: 'Set channel slowmode duration',
    category: 'Moderation',
    aliases: ['slow'],
    cooldown: 5,
    usage: '.slowmode [duration] [#channel]\nExample: .slowmode 10',
    
    async execute(message: Message, args: string[], client: Client): Promise<void> {
        try {
            if (!message.guild) {
                await message.reply('```❌ This command can only be used in a server```');
                return;
            }

            if (!args[0]) {
                await message.reply('```Usage: .slowmode [duration] [#channel]\nDuration in seconds, or 0 to disable```');
                return;
            }

            const duration = parseInt(args[0]);
            if (isNaN(duration) || duration < 0 || duration > 21600) {
                await message.reply('```❌ Please provide a valid duration between 0 and 21600 seconds (6 hours)```');
                return;
            }

            const channel = (message.mentions.channels.first() || message.channel) as TextChannel;
            
            if (!channel.isText()) {
                await message.reply('```❌ Slowmode can only be set in text channels```');
                return;
            }

            await channel.setRateLimitPerUser(duration);

            const embed = new WebEmbed()
                .setColor(duration === 0 ? '#00ff00' : '#ffff00')
                .setTitle('Slowmode Updated')
                .setDescription(
                    duration === 0
                        ? `Slowmode has been disabled in ${channel}`
                        : `Slowmode has been set to ${duration} seconds in ${channel}`
                );

            await message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });

        } catch (error) {
            Logger.error(`Error in slowmode command: ${(error as Error).message}`);
            await message.reply('```❌ An error occurred while setting slowmode```');
        }
    }
};

export default command;
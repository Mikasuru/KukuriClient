import { Message, Client, WebEmbed } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';
import Logger from '../../modules/Logger';

const command: Command = {
    name: 'unban',
    description: 'Unban a user from the server',
    category: 'Moderation',
    aliases: ['pardon'],
    cooldown: 5,
    usage: '.unban [userID]\nExample: .unban 123456789',
    
    async execute(message: Message, args: string[], client: Client): Promise<void> {
        try {
            if (!message.guild) {
                await message.reply('```❌ This command can only be used in a server```');
                return;
            }

            if (!args[0]) {
                await message.reply('```Usage: .unban [userID]\nExample: .unban 123456789```');
                return;
            }

            // Check if user is actually banned
            try {
                await message.guild.bans.fetch(args[0]);
            } catch {
                await message.reply('```❌ This user is not banned or the ID is invalid```');
                return;
            }

            // Attempt to unban
            try {
                await message.guild.members.unban(args[0]);
                
                const embed = new WebEmbed()
                    .setColor('#00ff00')
                    .setTitle('✅ User Unbanned')
                    .setDescription(`Successfully unbanned user with ID: ${args[0]}`);

                await message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
            } catch (error) {
                Logger.error(`Failed to unban user: ${(error as Error).message}`);
                await message.reply('```❌ Failed to unban user. They may not be banned or I may not have permission```');
            }

        } catch (error) {
            Logger.error(`Error in unban command: ${(error as Error).message}`);
            await message.reply('```❌ An error occurred while trying to unban the user```');
        }
    }
};

export default command;
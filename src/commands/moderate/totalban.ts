import { Message, Client, WebEmbed, GuildBan } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';
import Logger from '../../modules/Logger';

const command: Command = {
    name: 'totalbans',
    description: 'Check total bans in server',
    category: 'Moderation',
    aliases: ['banlist', 'bans'],
    cooldown: 10,
    usage: '.totalbans',
    
    async execute(message: Message, args: string[], client: Client): Promise<void> {
        try {
            if (!message.guild) {
                await message.reply('```❌ This command can only be used in a server```');
                return;
            }

            const statusMsg = await message.channel.send('```🔄 Fetching ban list...```');

            try {
                // Fetch all bans
                const bans = await message.guild.bans.fetch();
                
                if (bans.size === 0) {
                    const emptyEmbed = new WebEmbed()
                        .setColor('#00ff00')
                        .setTitle('Server Bans')
                        .setDescription('No banned users found in this server');
                    
                    await statusMsg.edit({ content: `${WebEmbed.hiddenEmbed}${emptyEmbed}` });
                    return;
                }

                // Get recent bans (last 10)
                const recentBans: GuildBan[] = Array.from(bans.values()).slice(0, 10);
                
                const banList = recentBans.map((ban, index) => {
                    const reason = ban.reason?.length ? ban.reason : 'No reason provided';
                    return `${index + 1}. ${ban.user.tag} (${ban.user.id})\n   Reason: ${reason}`;
                }).join('\n\n');

                const embed = new WebEmbed()
                    .setColor('#ff0000')
                    .setTitle('Server Bans')
                    .setDescription(
                        `Total Bans: ${bans.size}\n\n` +
                        `Recent Bans:\n${banList}` +
                        (bans.size > 10 ? '\n\nShowing 10 most recent bans' : '')
                    );

                await statusMsg.edit({ content: `${WebEmbed.hiddenEmbed}${embed}` });

            } catch (error) {
                Logger.error(`Error fetching bans: ${(error as Error).message}`);
                await statusMsg.edit('```❌ Failed to fetch ban list```');
            }

        } catch (error) {
            Logger.error(`Error in totalbans command: ${(error as Error).message}`);
            await message.reply('```❌ An error occurred while fetching server bans```');
        }
    }
};

export default command;
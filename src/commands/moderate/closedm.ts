import { Message, Client, DMChannel } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';
import Logger from '../../modules/Logger';

const command: Command = {
    name: 'closedm',
    description: 'Close DM channels with a user or all users',
    category: 'Moderation',
    aliases: ['deldm', 'closechat'],
    cooldown: 5,
    usage: '.closedm <@user/userid/all>',
    
    async execute(message: Message, args: string[], client: Client): Promise<void> {
        try {
            if (!args[0]) {
                await message.reply('```Usage: .closedm <@user/userid/all>\nExample: .closedm @user or .closedm all```');
                return;
            }

            if (args[0].toLowerCase() === 'all') {
                const statusMsg = await message.channel.send('```🔒 Closing all DM channels...```');
                
                const dmChannels = client.channels.cache.filter(channel => channel instanceof DMChannel);
                let closedCount = 0;
                
                for (const [, channel] of dmChannels) {
                    try {
                        await (channel as DMChannel).delete();
                        closedCount++;
                    } catch (error) {
                        Logger.error(`Error closing DM channel ${channel.id}: ${(error as Error).message}`);
                    }
                }

                await statusMsg.edit(`\`\`\`✅ Successfully closed ${closedCount} DM channels.\`\`\``);
                return;
            }

            let targetUser = message.mentions.users.first();
            if (!targetUser) {
                try {
                    targetUser = await client.users.fetch(args[0]);
                } catch {
                    await message.reply('```❌ Invalid user ID or mention```');
                    return;
                }
            }

            const statusMsg = await message.channel.send(`\`\`\`🔒 Closing DM channel with ${targetUser.tag}...\`\`\``);

            try {
                const dmChannel = await targetUser.createDM();
                await dmChannel.delete();
                await statusMsg.edit(`\`\`\`✅ Successfully closed DM channel with ${targetUser.tag}\`\`\``);
            } catch (error) {
                Logger.error(`Error closing DM channel: ${(error as Error).message}`);
                await statusMsg.edit('```❌ Failed to close DM channel```');
            }

        } catch (error) {
            Logger.error(`Error in closedm command: ${(error as Error).message}`);
            await message.reply('```❌ An error occurred while closing DM channels```');
        }
    }
};

export default command;
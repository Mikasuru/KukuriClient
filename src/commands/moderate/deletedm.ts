import { Message, Client, DMChannel } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';
import Logger from '../../modules/Logger';

const command: Command = {
    name: 'deletedm',
    description: 'Delete messages in DMs with a user or all users',
    category: 'Moderation',
    aliases: ['deldm', 'cleardm'],
    cooldown: 10,
    usage: '.deletedm <@user/userid/all>',
    
    async execute(message: Message, args: string[], client: Client): Promise<void> {
        try {
            if (!args[0]) {
                await message.reply('```Usage: .deletedm <@user/userid/all>\nExample: .deletedm @user or .deletedm all```');
                return;
            }

            if (args[0].toLowerCase() === 'all') {
                const statusMsg = await message.channel.send('```🗑️ Deleting all previous DMs...```');
                
                const dmChannels = client.channels.cache.filter(channel => channel instanceof DMChannel);
                let deletedCount = 0;
                
                for (const [, channel] of dmChannels) {
                    try {
                        const messages = await (channel as DMChannel).messages.fetch();
                        for (const msg of messages.values()) {
                            if (msg.author.id === client.user?.id && msg.deletable) {
                                await msg.delete();
                                deletedCount++;
                            }
                        }
                    } catch (error) {
                        Logger.error(`Error deleting messages in channel ${channel.id}: ${(error as Error).message}`);
                    }
                }

                await statusMsg.edit(`\`\`\`✅ Successfully deleted ${deletedCount} messages from all DM channels\`\`\``);
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

            const statusMsg = await message.channel.send(`\`\`\`🗑️ Deleting DMs with ${targetUser.tag}...\`\`\``);

            try {
                const dmChannel = await targetUser.createDM();
                const messages = await dmChannel.messages.fetch();
                let deletedCount = 0;

                for (const msg of messages.values()) {
                    if (msg.author.id === client.user?.id && msg.deletable) {
                        await msg.delete();
                        deletedCount++;
                    }
                }

                await statusMsg.edit(`\`\`\`✅ Successfully deleted ${deletedCount} messages with ${targetUser.tag}\`\`\``);
            } catch (error) {
                Logger.error(`Error deleting DM messages: ${(error as Error).message}`);
                await statusMsg.edit('```❌ Failed to delete DM messages```');
            }

        } catch (error) {
            Logger.error(`Error in deletedm command: ${(error as Error).message}`);
            await message.reply('```❌ An error occurred while deleting DM messages```');
        }
    }
};

export default command;
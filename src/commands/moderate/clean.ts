import { Message, Client, WebEmbed, Collection, TextChannel } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';
import Logger from '../../modules/Logger';
import notifier from 'node-notifier';

const command: Command = {
    name: 'clean',
    description: 'Clean a specified number of messages',
    category: 'Moderation',
    aliases: ['clear', 'purge'],
    cooldown: 2,
    usage: '.clean [amount]\nExample: .clean 10',
    
    async execute(message: Message, args: string[], client: Client): Promise<void> {
        try {
            if (!message.guild) {
                await message.reply('```❌ This command can only be used in a server```');
                return;
            }

            if (args.length !== 1 || isNaN(Number(args[0]))) {
                await message.reply('```❌ Please provide a valid number of messages to delete\nExample: .clean 10```');
                return;
            }

            const amount = Math.floor(Number(args[0]));
            if (amount <= 0 || amount > 100) {
                await message.reply('```❌ Please provide a number between 1 and 100```');
                return;
            }

            // Confirm deletion
            const confirmEmbed = new WebEmbed()
                .setColor('#ff0000')
                .setTitle('⚠️ Confirm Message Deletion')
                .setDescription(
                    `Are you sure you want to delete ${amount} messages?\n` +
                    `This action cannot be undone.\n\n` +
                    `Reply with "yes" to confirm or "no" to cancel.`
                );

            const confirmMsg = await message.channel.send({ 
                content: `${WebEmbed.hiddenEmbed}${confirmEmbed}` 
            });

            try {
                const collected: Collection<string, Message> = await message.channel.awaitMessages({
                    filter: m => m.author.id === message.author.id,
                    max: 1,
                    time: 30000,
                    errors: ['time']
                });

                const response = collected.first();
                if (!response) {
                    await confirmMsg.edit('```❌ Operation timed out```');
                    return;
                }

                if (response.content.toLowerCase() === 'yes') {
                    const statusMsg = await message.channel.send(`\`\`\`🔄 Deleting ${amount} messages...\`\`\``);

                    let deletedCount = 0;
                    if (message.channel instanceof TextChannel) {
                        const messages = await message.channel.messages.fetch({ 
                            limit: amount + 1 
                        });

                        for (const msg of messages.values()) {
                            if (msg.deletable) {
                                await msg.delete();
                                deletedCount++;
                                // Add small delay to prevent rate limiting
                                await new Promise(resolve => setTimeout(resolve, 1000));
                            }
                        }

                        const resultEmbed = new WebEmbed()
                            .setColor('#00ff00')
                            .setTitle('✅ Deletion Complete')
                            .setDescription(
                                `Successfully deleted ${deletedCount} messages.\n` +
                                `Some messages may not have been deleted due to permissions or age restrictions.`
                            );

                        // Desktop notification
                        notifier.notify({
                            title: 'Kukuri Client',
                            message: `Successfully deleted ${deletedCount} messages.`,
                            sound: true,
                            wait: false
                        });

                        await statusMsg.edit({ 
                            content: `${WebEmbed.hiddenEmbed}${resultEmbed}` 
                        });

                        // Delete status message after 5 seconds
                        setTimeout(() => {
                            statusMsg.delete().catch(() => {});
                        }, 5000);
                    }
                } else {
                    await confirmMsg.edit('```Operation cancelled```');
                }

                // Clean up confirmation message
                setTimeout(() => {
                    confirmMsg.delete().catch(() => {});
                    response.delete().catch(() => {});
                }, 3000);

            } catch (error) {
                Logger.error(`Message collection error: ${(error as Error).message}`);
                await message.reply('```❌ Operation timed out or was cancelled```');
            }

        } catch (error) {
            Logger.error(`Error in clean command: ${(error as Error).message}`);
            await message.reply('```❌ An error occurred while trying to delete messages```');
        }
    }
};

export default command;
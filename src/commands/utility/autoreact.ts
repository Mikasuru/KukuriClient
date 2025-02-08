import { Message, Client } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';
import { MemoryCache } from '../../modules/CacheManager';
import Logger from '../../modules/Logger';

interface AutoReaction {
    emoji: string;
    addedBy: string;
    timestamp: number;
}

// Initialize event handler
export const initAutoReactHandler = (client: Client, tokenConfig: any, isReady: boolean) => {
    client.on('messageCreate', async (message) => {
        if (!isReady) return;
        if (message.author.id !== tokenConfig.ownerId) return;

        try {
            const reactionCache = MemoryCache.getInstance<AutoReaction[]>();
            const cacheKey = `autoReactions:${client.user?.id}`;
            const reactions = reactionCache.get(cacheKey) || [];

            for (const reaction of reactions) {
                try {
                    await message.react(reaction.emoji);
                } catch (error) {
                    Logger.error(`Failed to add reaction ${reaction.emoji}: ${(error as Error).message}`);
                }
            }
        } catch (error) {
            Logger.error(`Error in auto reaction handler: ${(error as Error).message}`);
        }
    });
};

const command: Command = {
    name: 'autoreact',
    description: 'Manage auto reactions to messages',
    category: 'Utility',
    aliases: ['ar', 'react'],
    cooldown: 3,
    usage: '.autoreact [add/remove/list] [emoji]\nExample: .autoreact add 👍',

    async execute(message: Message, args: string[], client: Client): Promise<void> {
        const reactionCache = MemoryCache.getInstance<AutoReaction[]>();
        const cacheKey = `autoReactions:${client.user?.id}`;
        const currentReactions = reactionCache.get(cacheKey) || [];

        if (args.length === 0) {
            await message.channel.send('```❌ Please specify an action: add, remove, or list```');
            return;
        }

        const action = args[0].toLowerCase();

        switch (action) {
            case 'add': {
                if (args.length < 2) {
                    await message.channel.send('```❌ Please provide an emoji to add```');
                    return;
                }

                const emoji = args[1];
                
                try {
                    await message.react(emoji);
                    await message.reactions.removeAll();
                } catch (error) {
                    await message.channel.send('```❌ Invalid emoji provided```');
                    return;
                }

                const newReaction: AutoReaction = {
                    emoji,
                    addedBy: message.author.id,
                    timestamp: Date.now()
                };

                currentReactions.push(newReaction);
                reactionCache.set(cacheKey, currentReactions);

                await message.channel.send(
                    '```✅ Auto reaction added successfully!\n' +
                    '⚠️ Note: Auto reactions are stored in memory and will be cleared when the bot restarts```'
                );
                break;
            }

            case 'remove': {
                if (args.length < 2) {
                    await message.channel.send('```❌ Please provide an emoji to remove```');
                    return;
                }

                const emoji = args[1];
                const initialLength = currentReactions.length;
                
                const updatedReactions = currentReactions.filter(r => r.emoji !== emoji);
                reactionCache.set(cacheKey, updatedReactions);

                if (updatedReactions.length === initialLength) {
                    await message.channel.send('```❌ Emoji not found in auto reactions```');
                } else {
                    await message.channel.send('```✅ Auto reaction removed successfully```');
                }
                break;
            }

            case 'list': {
                if (currentReactions.length === 0) {
                    await message.channel.send('```❌ No auto reactions set```');
                    return;
                }

                const reactionList = currentReactions.map((reaction, index) => {
                    const timestamp = new Date(reaction.timestamp).toLocaleString();
                    return `${index + 1}. ${reaction.emoji} (Added: ${timestamp})`;
                }).join('\n');

                await message.channel.send(
                    '```Current Auto Reactions:\n' +
                    '═══════════════════\n' +
                    reactionList + '\n\n' +
                    '⚠️ Note: Auto reactions will be cleared when the bot restarts```'
                );
                break;
            }

            default:
                await message.channel.send('```❌ Invalid action. Use: add, remove, or list```');
        }
    }
};

export default command;
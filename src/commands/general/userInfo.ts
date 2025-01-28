import { Message, Client } from 'discord.js-selfbot-v13';
import { Command } from '@interfaces/index';
import { ErrorHandler, CommandError } from '@modules/ErrorHandler';
import { MemoryCache } from '@modules/CacheManager';
import Logger from '@modules/Logger';

const command: Command = {
    name: 'userinfo',
    description: 'Display information about a user',
    category: 'General', 
    aliases: ['ui', 'user'],
    cooldown: 5,

    async execute(message: Message, args: string[], client: Client): Promise<void> {
        const errorHandler = ErrorHandler.getInstance();
        const cache = MemoryCache.getInstance<any>();

        try {
            // Get target user
            const targetUser = message.mentions.users.first() || 
                             message.author;

            // Try to get cached user info
            const cacheKey = `userInfo:${targetUser.id}`;
            const userInfo = await cache.getOrSet(cacheKey, async () => {
                Logger.info(`Fetching user info for ${targetUser.tag}`);
                const fetchedUser = await client.users.fetch(targetUser.id);
                return {
                    id: fetchedUser.id,
                    tag: fetchedUser.tag,
                    createdAt: fetchedUser.createdAt,
                    avatar: fetchedUser.displayAvatarURL({ dynamic: true })
                };
            });

            // Create formatted message
            const userInfoMessage = [
                '```',
                `User Information - ${userInfo.tag}`,
                '══════════════════════',
                `ID: ${userInfo.id}`,
                `Tag: ${userInfo.tag}`,
                `Created At: ${userInfo.createdAt.toLocaleString()}`,
                `Avatar URL: ${userInfo.avatar}`,
                '```'
            ].join('\n');

            await message.channel.send(userInfoMessage);

        } catch (error) {
            // Handle specific errors
            if (error instanceof CommandError) {
                await message.reply(error.message);
                return;
            }

            // Log and handle unexpected errors
            errorHandler.handleError(error as Error, 'userInfo command');
            await message.reply('An error occurred while fetching user information.');
        }
    }
};

export default command;
import { Message, Client, Guild, User } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';
import Logger from '../../modules/Logger';

const command: Command = {
    name: 'information',
    description: 'Show information about user, server, or yourself',
    category: 'General',
    aliases: ['info', 'whois'],
    usage: '.information [user/server]\nExample: .information @user',
    cooldown: 3,

    async execute(message: Message, args: string[], client: Client): Promise<void> {
        try {
            if (args.length === 0) {
                await showUserInfo(message, message.author);
                return;
            }

            const target = args[0].toLowerCase();

            if (target === 'server') {
                await showServerInfo(message);
            } else {
                const user = message.mentions.users.first() || 
                           await client.users.fetch(args[0]).catch(() => null);
                
                if (!user) {
                    await message.channel.send('```❌ User not found```');
                    return;
                }

                await showUserInfo(message, user);
            }
        } catch (error) {
            Logger.error(`Error in information command: ${error instanceof Error ? error.message : 'Unknown error'}`);
            await message.channel.send('```❌ An error occurred while fetching information```');
        }
    }
};

async function showUserInfo(message: Message, user: User): Promise<void> {
    try {
        const member = message.guild ? await message.guild.members.fetch(user.id).catch(() => null) : null;
        const createdAt = Math.floor(user.createdTimestamp / 1000);
        const joinedAt = member ? Math.floor(member.joinedTimestamp as number / 1000) : null;

        const badges = user.flags?.toArray().length ? 
            user.flags.toArray().map(flag => flag.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ') 
            : 'None';

        const infoText = [
            '┌───[ User Information ]───┐',
            `├ ID: ${user.id}`,
            `├ Tag: ${user.tag}`,
            `├ Created: <t:${createdAt}:R>`,
            `├ Badges: ${badges}`,
            `├ Bot: ${user.bot ? 'Yes' : 'No'}`,
            `├ System: ${user.system ? 'Yes' : 'No'}`
        ];

        if (member) {
            infoText.push(
                '├───[ Server Member ]───┤',
                `├ Nickname: ${member.nickname || 'None'}`,
                `├ Joined: <t:${joinedAt}:R>`,
                `├ Roles: ${member.roles.cache.size - 1}`,
                `├ Highest Role: ${member.roles.highest.name === '@everyone' ? 'None' : member.roles.highest.name}`,
                `├ Color: ${member.displayHexColor === '#000000' ? 'None' : member.displayHexColor}`
            );
        }

        infoText.push('└──────────────────────────┘');
        await message.channel.send('```' + infoText.join('\n') + '```');

    } catch (error) {
        Logger.error(`Error showing user info: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
}

async function showServerInfo(message: Message): Promise<void> {
    if (!message.guild) {
        await message.channel.send('```❌ This command can only be used in a server```');
        return;
    }

    try {
        const guild: Guild = message.guild;
        const owner = await guild.fetchOwner();
        const createdAt = Math.floor(guild.createdTimestamp / 1000);

        const channels = {
            text: guild.channels.cache.filter(c => c.type === 'GUILD_TEXT').size,
            voice: guild.channels.cache.filter(c => c.type === 'GUILD_VOICE').size,
            announcement: guild.channels.cache.filter(c => c.type === 'GUILD_NEWS').size,
            stage: guild.channels.cache.filter(c => c.type === 'GUILD_STAGE_VOICE').size,
            forum: guild.channels.cache.filter(c => c.type === 'GUILD_FORUM').size,
            category: guild.channels.cache.filter(c => c.type === 'GUILD_CATEGORY').size
        };

        const members = {
            total: guild.memberCount,
            online: guild.members.cache.filter(m => m.presence?.status === 'online').size,
            idle: guild.members.cache.filter(m => m.presence?.status === 'idle').size,
            dnd: guild.members.cache.filter(m => m.presence?.status === 'dnd').size,
            offline: guild.members.cache.filter(m => !m.presence || m.presence.status === 'offline').size
        };

        const infoText = [
            '┌───[ Server Information ]───┐',
            `├ Name: ${guild.name}`,
            `├ ID: ${guild.id}`,
            `├ Owner: ${owner.user.tag}`,
            `├ Created: <t:${createdAt}:R>`,
            '├──────[ Boost Status ]──────┤',
            `├ Level: ${guild.premiumTier}`,
            `├ Count: ${guild.premiumSubscriptionCount || 0}`,
            '├─────────[ Members ]────────┤',
            `├ Total: ${members.total}`,
            `├ Online: ${members.online}`,
            `├ Idle: ${members.idle}`,
            `├ DND: ${members.dnd}`,
            `├ Offline: ${members.offline}`,
            '├────────[ Channels ]────────┤',
            `├ Text: ${channels.text}`,
            `├ Voice: ${channels.voice}`,
            `├ Announcement: ${channels.announcement}`,
            `├ Stage: ${channels.stage}`,
            `├ Forum: ${channels.forum}`,
            `├ Categories: ${channels.category}`,
            '├──────────[ Other ]─────────┤',
            `├ Roles: ${guild.roles.cache.size}`,
            `├ Emojis: ${guild.emojis.cache.size}`,
            `├ Stickers: ${guild.stickers.cache.size}`,
            `├ Verification: ${guild.verificationLevel}`,
            `├ NSFW Level: ${guild.nsfwLevel}`,
            '└────────────────────────────┘'
        ];

        await message.channel.send('```' + infoText.join('\n') + '```');

    } catch (error) {
        Logger.error(`Error showing server info: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
}

export default command;
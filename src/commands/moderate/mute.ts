import { Message, Client } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';
import Logger from '../../modules/Logger';

const command: Command = {
    name: 'mute',
    description: 'Mute a member in the server',
    category: 'Moderation',
    aliases: ['silence'],
    cooldown: 5,
    usage: '.mute [@user] [duration] [reason]\nExample: .mute @user 1h Spamming',
    
    async execute(message: Message, args: string[], client: Client): Promise<void> {
        try {
            const member = message.mentions.members?.first();
            if (!member) {
                await message.reply('```❌ Please mention a valid member.```');
                return;
            }

            const duration = parseDuration(args[1]);
            if (!duration) {
                await message.reply('```❌ Please provide a valid duration (e.g., 1h, 30m).```');
                return;
            }

            if (!member.moderatable) {
                await message.reply('```❌ I cannot mute this member.```');
                return;
            }

            const reason = args.slice(2).join(' ') || 'No reason provided';

            await member.timeout(duration, reason);
            await message.channel.send(
                `\`\`\`✅ Muted ${member.user.tag} for ${args[1]} | Reason: ${reason}\`\`\``
            );

        } catch (error) {
            Logger.error(`Error in mute command: ${(error as Error).message}`);
            await message.reply('```❌ Failed to mute member.```');
        }
    }
};

function parseDuration(durationStr: string): number | null {
    const match = durationStr.match(/^(\d+)([mhd])$/);
    if (!match) return null;

    const [, amount, unit] = match;
    const multipliers = {
        'm': 60 * 1000, // minutes
        'h': 60 * 60 * 1000, // hours
        'd': 24 * 60 * 60 * 1000 // days
    };

    return parseInt(amount) * multipliers[unit as keyof typeof multipliers];
}

export default command;
import { Message, Client } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';
import Logger from '../../modules/Logger';

const command: Command = {
    name: 'ban',
    description: 'Ban a member from the server',
    category: 'Moderation',
    aliases: ['banish'],
    cooldown: 5,
    usage: '.ban [@user] [reason]\nExample: .ban @user Breaking rules',
    
    async execute(message: Message, args: string[], client: Client): Promise<void> {
        try {
            const member = message.mentions.members?.first();
            if (!member) {
                await message.reply('```❌ Please mention a valid member.```');
                return;
            }

            if (!member.bannable) {
                await message.reply('```❌ I cannot ban this member.```');
                return;
            }

            const reason = args.slice(1).join(' ') || 'No reason provided';

            await member.ban({ reason });
            await message.channel.send(`\`\`\`✅ Banned ${member.user.tag} | Reason: ${reason}\`\`\``);

        } catch (error) {
            Logger.error(`Error in ban command: ${(error as Error).message}`);
            await message.reply('```❌ Failed to ban member.```');
        }
    }
};

export default command;
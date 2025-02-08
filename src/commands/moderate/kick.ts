import { Message, Client } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';
import Logger from '../../modules/Logger';

const command: Command = {
    name: 'kick',
    description: 'Kick a member from the server',
    category: 'Moderation',
    aliases: ['remove'],
    cooldown: 5,
    usage: '.kick [@user] [reason]\nExample: .kick @user Breaking rules',
    
    async execute(message: Message, args: string[], client: Client): Promise<void> {
        try {
            const member = message.mentions.members?.first();
            if (!member) {
                await message.reply('```❌ Please mention a valid member.```');
                return;
            }

            if (!member.kickable) {
                await message.reply('```❌ I cannot kick this member.```');
                return;
            }

            const reason = args.slice(1).join(' ') || 'No reason provided';

            await member.kick(reason);
            await message.channel.send(`\`\`\`✅ Kicked ${member.user.tag} | Reason: ${reason}\`\`\``);

        } catch (error) {
            Logger.error(`Error in kick command: ${(error as Error).message}`);
            await message.reply('```❌ Failed to kick member.```');
        }
    }
};

export default command;
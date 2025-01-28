import { Message, Client } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';

const command: Command = {
    name: 'avatar',
    description: 'Get user\'s avatar',
    category: 'General',
    aliases: ['av', 'pfp'],
    cooldown: 3,
    usage: '.avatar [@user]\nExample: .avatar @username',
    
    async execute(message: Message, args: string[], client: Client): Promise<Message> {
        const user = message.mentions.users.first() || message.author;
        return message.channel.send(user.displayAvatarURL({ dynamic: true, size: 4096 }));
    }
};

export default command;
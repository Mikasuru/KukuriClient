import { Message, Client } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';

const command: Command = {
    name: 'coinflip',
    description: 'Flip a coin',
    category: 'Fun',
    aliases: ['flip', 'coin'],
    cooldown: 3,
    
    async execute(message: Message, args: string[], client: Client): Promise<void> {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        await message.channel.send(`🪙 The coin landed on: **${result}**!`);
    }
};

export default command;
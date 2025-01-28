import { Message, Client } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';

const command: Command = {
    name: 'dice',
    description: 'Roll one or more dice with custom sides',
    category: 'Fun',
    aliases: ['roll', 'r'],
    usage: '.dice [number of dice] [sides]\nExample: .dice 2 6',
    cooldown: 3,
    
    async execute(message: Message, args: string[], client: Client): Promise<void> {
        const numDice = Math.min(parseInt(args[0]) || 1, 10);
        const sides = Math.min(parseInt(args[1]) || 6, 100);
        
        const rolls = Array.from({ length: numDice }, () => 
            Math.floor(Math.random() * sides) + 1
        );
        
        const total = rolls.reduce((sum, num) => sum + num, 0);
        
        await message.channel.send(
            `🎲 Rolling ${numDice} ${sides}-sided ${numDice === 1 ? 'die' : 'dice'}\n` +
            `Results: ${rolls.join(', ')}\n` +
            `Total: ${total}`
        );
    }
};

export default command;
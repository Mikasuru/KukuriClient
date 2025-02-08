import { Message, Client } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';

const command: Command = {
    name: '8ball',
    description: 'Ask the magic 8-ball a question',
    category: 'Fun',
    aliases: ['8b', 'fortune'],
    usage: '.8ball [question]\nExample: .8ball Will I ace my test?',
    cooldown: 3,
    
    async execute(message: Message, args: string[], client: Client): Promise<void> {
        if (args.length === 0) {
            await message.channel.send('Please ask a question!\n`Example: .8ball Will I ace my test?`');
            return;
        }

        const responses = [
            'It is certain.',
            'Without a doubt.',
            'Most likely.',
            'Yes.',
            'Ask again later.',
            'Cannot predict now.',
            'Don\'t count on it.',
            'My sources say no.',
            'Very doubtful.'
        ];

        const response = responses[Math.floor(Math.random() * responses.length)];
        const question = args.join(' ');

        await message.channel.send(
            `🎱 **Question:** ${question}\n` +
            `**Answer:** ${response}`
        );
    }
};

export default command;
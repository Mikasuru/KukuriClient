import { Message, Client } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';

const command: Command = {
    name: 'ping',
    description: 'Check bot\'s latency and performance',
    category: 'General',
    aliases: ['p', 'latency'],
    cooldown: 1,
    usage: 'ping',
    
    async execute(message: Message, args: string[], client: Client): Promise<void> {
        const startTime = Date.now();
        const sent = await message.channel.send('```css\n[ 📡 ] Checking Ping...```');
        
        const latency = sent.createdTimestamp - message.createdTimestamp;
        const apiLatency = Math.round(client.ws.ping);
        
        await sent.edit(
            `\`\`\`css\n[ 🏓 PING STATS ]\n` +
            `📡 Latency: ${latency}ms\n` +
            `🤖 API Latency: ${apiLatency}ms\`\`\``
        );
    }
};

export default command;
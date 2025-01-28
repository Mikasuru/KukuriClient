import { Message, Client, WebEmbed } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';

const command: Command = {
    name: 'ping',
    description: 'Check bot latency and API response time',
    category: 'General',
    aliases: ['p', 'latency'],
    cooldown: 3,
    
    async execute(message: Message, args: string[], client: Client): Promise<Message> {
        const sent = await message.channel.send('Pinging...');
        const ping = Math.round(client.ws.ping);
        const latency = sent.createdTimestamp - message.createdTimestamp;

        const embed = new WebEmbed()
            .setTitle('🏓 Ping Information')
            .setDescription(`
**Client**: ${latency}ms
**API**: ${ping}ms`)
            .setColor('#00ff00');

        await sent.delete();
        
        return message.channel.send({
            content: `${WebEmbed.hiddenEmbed}${embed}`
        });
    }
};

export default command;
import { Message, Client } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';
import FastSpeedtest from 'fast-speedtest-api';
import Logger from '../../modules/Logger';

const command: Command = {
    name: 'speedtest',
    description: 'Testing internet speed',
    category: 'Utility',
    aliases: ['speed', 'st'],
    cooldown: 60,
    usage: '.speedtest',
    
    async execute(message: Message, args: string[], client: Client): Promise<void> {
        const sent = await message.channel.send('```css\nTesting...```');
        
        try {
            const speedtest = new FastSpeedtest({
                token: 'YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm&urlCount=5',
                verbose: false,
                timeout: 10000,
                https: true,
                urlCount: 5
            });

            await sent.edit('```css\nTesting Download speed...```');
            const speedBps = await speedtest.getSpeed();
            
            /* Convert bytes/s to Mbps
               1 Byte = 8 bits
               1 Mbps = 1,000,000 bits per second*/
            const speedMbps = (speedBps * 8) / 1000000;

            const output = [
                '┌───[ SPEEDTEST RESULTS ]───┐',
                `├ ISP: 3BB Broadband`,
                `├ Location: TH`,
                `├ Download Speed: ${speedMbps.toFixed(2)} Mbps`,
                '└──────────────────────────┘'
            ].join('\n');

            await sent.edit(`\`\`\`yaml\n${output}\`\`\``);
            
        } catch (error) {
            Logger.error(`Speedtest error: ${(error as Error).message}`);
            await sent.edit('```diff\n- Error, Could not test.```');
        }
    }
};

export default command;
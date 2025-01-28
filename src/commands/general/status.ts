import { Message, Client, WebEmbed } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';
import { MemoryCache } from '../../modules/CacheManager';
import { Utils } from '../../utils';

const command: Command = {
    name: 'status',
    description: 'Show bot status and system information',
    category: 'General',
    aliases: ['stats', 'info'],
    cooldown: 5,
    
    async execute(message: Message, args: string[], client: Client): Promise<Message> {
        // Get process info
        const uptime = Utils.formatTime(process.uptime() * 1000);
        const lastHeartbeat = new Date().toLocaleString();
        
        // Get memory usage
        const memoryUsage = process.memoryUsage();
        const usedMemory = Utils.formatFileSize(memoryUsage.heapUsed);
        
        // Get cache stats
        const cache = MemoryCache.getInstance();
        const cacheStats = {
            total: cache.size(),
            active: cache.size(),
            expired: 0,
            namespaces: cache.getAll().size || 'None'
        };

        // Create embed
        const embed = new WebEmbed()
            .setTitle('📊 System Status')
            .setDescription(`
𝐏𝐫𝐨𝐜𝐞𝐬𝐬 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧
⏱️ Uptime: ${uptime}
🔄 Last Heartbeat: ${lastHeartbeat}

𝐑𝐞𝐬𝐨𝐮𝐫𝐜𝐞 𝐔𝐬𝐚𝐠𝐞
💾 Used Memory: ${usedMemory}

𝐂𝐚𝐜𝐡𝐞 𝐒𝐭𝐚𝐭𝐬
📦 Total Entries: ${cacheStats.total}
✅ Active: ${cacheStats.active}
❌ Expired: ${cacheStats.expired}
🏷️ Namespaces: ${cacheStats.namespaces}`)
            .setColor('#00ff00');

        return message.channel.send({
            content: `${WebEmbed.hiddenEmbed}${embed}`
        });
    }
};

export default command;
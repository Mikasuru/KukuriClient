import { Message, Client, RichPresence, CustomStatus, SpotifyRPC, ActivityType } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';
import { MemoryCache } from '../../modules/CacheManager';
import Logger from '../../modules/Logger';

interface RPCConfig {
    type: 'samsung' | 'discord' | 'spotify';
    data: any;
    timestamp: number;
}

// Example list
const EXAMPLES = {
    samsung: [
        '.rpc samsung blueArchive',
        '.rpc samsung honkai',
        '.rpc samsung genshin'
    ],
    discord: [
        '.rpc discord game Minecraft',
        '.rpc discord stream "Playing Valorant" "https://twitch.tv/username"',
        '.rpc discord watch "Netflix"',
        '.rpc discord listen "Spotify"'
    ],
    spotify: [
        '.rpc spotify "Never Gonna Give You Up" "Rick Astley" "Whenever You Need Somebody"',
        '.rpc spotify "ロボットハート" "Yunomi; Kizuna AI" "未来茶屋"'
    ]
};

// Application IDs
const SamsungApp = {
    blueArchive: 'com.YostarJP.BlueArchive',
    honkai: 'com.miHoYo.bh3oversea',
    genshin: 'com.miHoYo.GenshinImpact'
} as const;

// Activity types
const ActivityList: ActivityType[] = ['PLAYING', 'STREAMING', 'LISTENING', 'WATCHING', 'COMPETING'];

const command: Command = {
    name: 'rpc',
    description: 'Manage Rich Presence settings',
    category: 'Utility',
    aliases: ['presence', 'activity'],
    usage: '.rpc [type] [action] [...args]\n' +
           'Types: samsung, discord, spotify, stop\n' +
           'Use .rpc examples to see example commands',

    async execute(message: Message, args: string[], client: Client): Promise<void> {
        const rpcCache = MemoryCache.getInstance<RPCConfig>();
        const cacheKey = `rpc:${client.user?.id}`;

        if (args.length === 0) {
            await showHelp(message);
            return;
        }

        const type = args[0].toLowerCase();

        // Show examples if requested
        if (type === 'examples') {
            await showExamples(message);
            return;
        }

        // Handle stop command
        if (type === 'stop') {
            rpcCache.delete(cacheKey);
            await client.user?.setPresence({ activities: [] });
            await message.channel.send('```✅ RPC stopped successfully```');
            return;
        }

        switch (type) {
            case 'samsung': {
                if (args.length < 2) {
                    const appList = Object.keys(SamsungApp).join(', ');
                    await message.channel.send(`\`\`\`Available Samsung apps: ${appList}\nExample: .rpc samsung blueArchive\`\`\``);
                    return;
                }
            
                const appName = args[1].toLowerCase() as keyof typeof SamsungApp;
                const appId = SamsungApp[appName];
            
                if (!appId) {
                    await message.channel.send('```❌ Invalid app name. Available apps: ' + Object.keys(SamsungApp).join(', ') + '```');
                    return;
                }
            
                try {
                    await client.user?.setSamsungActivity(appId, 'START');
                    
                    rpcCache.set(cacheKey, {
                        type: 'samsung',
                        data: { appId, appName },
                        timestamp: Date.now()
                    });
            
                    await message.channel.send(
                        '```✅ Samsung RPC set successfully!\n' +
                        '⚠️ Note: RPC settings are stored in memory and will be cleared when the bot restarts```'
                    );
                } catch (error) {
                    Logger.error(`Samsung RPC error: ${(error as Error).message}`);
                    await message.channel.send('```❌ Failed to set Samsung RPC```');
                }
                break;
            }

            case 'discord': {
                if (args.length < 3) {
                    await message.channel.send(
                        '```Usage: .rpc discord [type] [name] [url?]\n' +
                        'Types: PLAYING, STREAMING, LISTENING, WATCHING, COMPETING\n' +
                        'Example: .rpc discord PLAYING Minecraft```'
                    );
                    return;
                }

                const activityType = args[1].toUpperCase() as ActivityType;
                const name = args.slice(2).join(' ');
                const url = args[3]; // Optional for streaming

                if (!ActivityList.includes(activityType)) {
                    await message.channel.send('```❌ Invalid activity type. Use: ' + ActivityList.join(', ') + '```');
                    return;
                }

                try {
                    const presence = new RichPresence(client)
                        .setType(activityType)
                        .setName(name)
                        .setStartTimestamp(Date.now());

                    if (url && activityType === 'STREAMING') {
                        presence.setURL(url);
                    }

                    await client.user?.setPresence({ activities: [presence] });

                    rpcCache.set(cacheKey, {
                        type: 'discord',
                        data: { type: activityType, name, url },
                        timestamp: Date.now()
                    });

                    await message.channel.send(
                        '```✅ Discord RPC set successfully!\n' +
                        '⚠️ Note: RPC settings are stored in memory and will be cleared when the bot restarts```'
                    );
                } catch (error) {
                    Logger.error(`Discord RPC error: ${(error as Error).message}`);
                    await message.channel.send('```❌ Failed to set Discord RPC```');
                }
                break;
            }

            case 'spotify': {
                if (args.length < 4) {
                    await message.channel.send(
                        '```Usage: .rpc spotify [songName] [artist] [album]\n' +
                        'Example: .rpc spotify "Never Gonna Give You Up" "Rick Astley" "Whenever You Need Somebody"```'
                    );
                    return;
                }

                const songName = args[1].replace(/"/g, '');
                const artist = args[2].replace(/"/g, '');
                const album = args[3].replace(/"/g, '');

                try {
                    const spotify = new SpotifyRPC(client)
                        .setState(artist)
                        .setDetails(songName)
                        .setAssetsLargeText(album)
                        .setStartTimestamp(Date.now())
                        .setEndTimestamp(Date.now() + 1000 * 180); // 3 minutes default

                    await client.user?.setPresence({ activities: [spotify] });

                    rpcCache.set(cacheKey, {
                        type: 'spotify',
                        data: { songName, artist, album },
                        timestamp: Date.now()
                    });

                    await message.channel.send(
                        '```✅ Spotify RPC set successfully!\n' +
                        '⚠️ Note: RPC settings are stored in memory and will be cleared when the bot restarts```'
                    );
                } catch (error) {
                    Logger.error(`Spotify RPC error: ${(error as Error).message}`);
                    await message.channel.send('```❌ Failed to set Spotify RPC```');
                }
                break;
            }

            default:
                await showHelp(message);
        }
    }
};

async function showHelp(message: Message): Promise<void> {
    const helpText = [
        'RPC Command Usage',
        '═══════════════',
        'Available Types:',
        '• samsung - Set Samsung game activity',
        '• discord - Set Discord rich presence',
        '• spotify - Set Spotify activity',
        '• stop - Stop current RPC',
        '',
        'Use .rpc examples to see example commands for each type',
        '',
        'Basic Usage:',
        '.rpc [type] [options...]'
    ].join('\n');

    await message.channel.send('```' + helpText + '```');
}

async function showExamples(message: Message): Promise<void> {
    const exampleText = [
        'RPC Command Examples',
        '══════════════════',
        '',
        'Samsung RPC:',
        EXAMPLES.samsung.join('\n'),
        '',
        'Discord RPC:',
        EXAMPLES.discord.join('\n'),
        '',
        'Spotify RPC:',
        EXAMPLES.spotify.join('\n'),
        '',
        'Stop RPC:',
        '.rpc stop'
    ].join('\n');

    await message.channel.send('```' + exampleText + '```');
}

// Initialize RPC handler in MultiClientManager.ts
export const initRPCHandler = (client: Client) => {
    client.on('ready', async () => {
        try {
            const rpcCache = MemoryCache.getInstance<RPCConfig>();
            const cacheKey = `rpc:${client.user?.id}`;
            const savedRPC = rpcCache.get(cacheKey);

            if (!savedRPC) return;

            switch (savedRPC.type) {
                case 'samsung':
                    await client.user?.setSamsungActivity(savedRPC.data.appId, 'START');
                    break;
                    
                case 'discord': {
                    const presence = new RichPresence(client)
                        .setType(savedRPC.data.type)
                        .setName(savedRPC.data.name)
                        .setStartTimestamp(savedRPC.timestamp);

                    if (savedRPC.data.url && savedRPC.data.type === 'STREAMING') {
                        presence.setURL(savedRPC.data.url);
                    }

                    await client.user?.setPresence({ activities: [presence] });
                    break;
                }

                case 'spotify': {
                    const spotify = new SpotifyRPC(client)
                        .setState(savedRPC.data.artist)
                        .setDetails(savedRPC.data.songName)
                        .setAssetsLargeText(savedRPC.data.album)
                        .setStartTimestamp(savedRPC.timestamp)
                        .setEndTimestamp(savedRPC.timestamp + 1000 * 180);

                    await client.user?.setPresence({ activities: [spotify] });
                    break;
                }
            }
        } catch (error) {
            Logger.error(`Error restoring RPC: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    });
};

export default command;
import { Message, Client, TextChannel, VoiceBasedChannel } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';
import Logger from '../../modules/Logger';
import ytdl from '@distube/ytdl-core';

interface SongInfo {
    title: string;
    duration: number;
    url: string;
    requestedby: string;
}

interface QueueConstruct {
    textChannel: TextChannel;
    voiceChannel: VoiceBasedChannel;
    connection: any;
    dispatcher: any;
    songs: SongInfo[];
    volume: number;
    playing: boolean;
    loop: boolean;
    skipped: boolean;
}

const queue = new Map<string, QueueConstruct>();

async function joinVoiceChannel(voiceChannel: VoiceBasedChannel) {
    try {
        const connection = await voiceChannel.client.voice.joinChannel(voiceChannel, {
            selfDeaf: false,
            selfMute: false,
            selfVideo: false
        });
        return connection;
    } catch (error) {
        Logger.error(`Failed to join voice channel: ${error}`);
        throw error;
    }
}

const command: Command = {
    name: 'play',
    description: 'Play music from YouTube',
    category: 'Music',
    aliases: ['p'],
    cooldown: 3,
    usage: '.play [URL]\nExample: .play https://youtube.com/...',
    
    async execute(message: Message, args: string[], client: Client): Promise<void> {
        try {
            if (!message.guild) {
                await message.reply('```❌ This command can only be used in a server```');
                return;
            }
    
            if (!args[0]) {
                await message.reply('```❌ Please provide a YouTube URL```');
                return;
            }
    
            const voiceChannel = message.member?.voice?.channel;
            if (!voiceChannel || !['GUILD_VOICE', 'GUILD_STAGE_VOICE'].includes(voiceChannel.type)) {
                await message.reply('```❌ You must be in a valid voice channel```');
                return;
            }
    
            Logger.info('Getting song details...');
            const songInfo = await ytdl.getInfo(args[0]);
    
            const song: SongInfo = {
                title: songInfo.videoDetails.title,
                duration: parseInt(songInfo.videoDetails.lengthSeconds),
                url: args[0],
                requestedby: message.author.username
            };
    
            Logger.info(`Got song details for: ${song.title}`);
    
            const serverQueue = queue.get(message.guild.id);
    
            if (!serverQueue) {
                const validVoiceChannel = voiceChannel as VoiceBasedChannel;
                const queueConstruct: QueueConstruct = {
                    textChannel: message.channel as TextChannel,
                    voiceChannel: validVoiceChannel,
                    connection: null,
                    dispatcher: null,
                    songs: [],
                    volume: 1,
                    playing: true,
                    loop: false,
                    skipped: false
                };
    
                queueConstruct.songs.push(song);
                queue.set(message.guild.id, queueConstruct);
    
                try {
                    queueConstruct.connection = await joinVoiceChannel(validVoiceChannel);
                    await play(song, message);
    
                    await message.channel.send([
                        '```ini',
                        '[ Now Playing ]',
                        '',
                        `[Title] ${song.title}`,
                        `[Duration] ${Math.floor(song.duration / 60)}:${(song.duration % 60)
                            .toString()
                            .padStart(2, '0')}`,
                        `[Requested By] ${song.requestedby}`,
                        '```'
                    ].join('\n'));
    
                } catch (error) {
                    Logger.error(`Error joining voice channel: ${error}`);
                    queue.delete(message.guild.id);
                    await message.reply('```❌ Failed to join voice channel```');
                    return;
                }
            } else {
                serverQueue.songs.push(song);
                Logger.info(`Added to queue: ${song.title}`);
    
                await message.channel.send([
                    '```ini',
                    '[ Added to Queue ]',
                    '',
                    `[Title] ${song.title}`,
                    `[Duration] ${Math.floor(song.duration / 60)}:${(song.duration % 60)
                        .toString()
                        .padStart(2, '0')}`,
                    `[Position] #${serverQueue.songs.length}`,
                    `[Requested By] ${song.requestedby}`,
                    '```'
                ].join('\n'));
            }
    
        } catch (error) {
            Logger.error(`Error in play command: ${(error as Error).message}`);
            await message.reply('```❌ An error occurred while processing music command```');
        }
    }    
};

async function play(song: SongInfo, message: Message) {
    if (!message.guild) {
        Logger.error("message.guild is null. This command must be used within a server.");
        return;
    }

    const serverQueue = queue.get(message.guild.id);
    if (!serverQueue) return;

    try {
        const stream = ytdl(song.url, { 
            quality: 'highestaudio',
            highWaterMark: 1 << 25
        });

        const dispatcher = serverQueue.connection.playAudio(stream);

        dispatcher.on('start', () => {
            Logger.info(`Started playing: ${song.title}`);
            dispatcher.setVolume(serverQueue.volume);
        });

        dispatcher.on('finish', () => {
            if (!message.guild) {
                Logger.error("message.guild is null. This command must be used within a server.");
                return;
            }
            Logger.info(`Finished playing: ${song.title}`);
            serverQueue.songs.shift();
            if (serverQueue.songs.length > 0) {
                play(serverQueue.songs[0], message);
            } else {
                queue.delete(message.guild.id);
                serverQueue.connection.disconnect();
            }
        });

        dispatcher.on('error', (error: Error) => {
            Logger.error(`Error playing song: ${error.message}`);
            serverQueue.songs.shift();
            if (serverQueue.songs.length > 0) {
                play(serverQueue.songs[0], message);
            }
        });

        serverQueue.dispatcher = dispatcher;

    } catch (error) {
        Logger.error(`Error starting playback: ${(error as Error).message}`);
        await message.channel.send('```❌ Failed to play song```');
        serverQueue.songs.shift();
        if (serverQueue.songs.length > 0) {
            play(serverQueue.songs[0], message);
        }
    }
}

export default command;

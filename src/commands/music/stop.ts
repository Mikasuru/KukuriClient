import { Message, Client, TextChannel, VoiceBasedChannel } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';
import Logger from '@/modules/Logger';

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

const command: Command = {
    name: 'stop',
    description: 'Stops the music and makes the bot leave the voice channel',
    category: 'Music',
    aliases: ['stop', 'st'],
    cooldown: 1,
    usage: '.stop',
    
    async execute(message: Message, args: string[], client: Client): Promise<void> {
        if (!message.guild) {
            await message.reply('```❌ This command can only be used in a server```');
            return;
        }

        const serverQueue = queue.get(message.guild.id);
        if (!serverQueue) {
            await message.channel.send("It already stopped");
            return;
        }

        serverQueue.songs = [];
        Logger.info("Stopped playing music");

        if (serverQueue.connection && serverQueue.connection._state && serverQueue.connection._state.subscription) {
            serverQueue.connection._state.subscription.player.stop();
        }

        await message.channel.send("Music stopped.");
    }
};

export default command;
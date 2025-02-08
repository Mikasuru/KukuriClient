import { Message, Client, WebEmbed, VoiceChannel } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';
import Logger from '../../modules/Logger';

const command: Command = {
    name: 'vc',
    description: 'Manage voice channels and members',
    category: 'Moderation',
    aliases: ['voice'],
    cooldown: 3,
    usage: `Voice Commands:
    .vckick <user> - Kick user from voice channel
    .vcmoveall <from channel> <to channel> - Move all users
    .vcmute <user> - Mute user
    .vcunmute <user> - Unmute user
    .vcdeafen <user> - Deafen user
    .vcundeafen <user> - Undeafen user
    .vcmove <user> <channel> - Move user to channel
    .vcjoin <channel> - Join voice channel
    .vcleave - Leave voice channel
    .vclimit <limit> <channel> - Set user limit`,
    
    async execute(message: Message, args: string[], client: Client): Promise<void> {
        try {
            if (!message.guild) {
                await message.reply('```❌ This command can only be used in a server```');
                return;
            }

            if (!args[0]) {
                await message.reply('```❌ Please specify a voice command\nUse .vc help for list of commands```');
                return;
            }

            const subCommand = args[0].toLowerCase();

            switch (subCommand) {
                case 'kick': {
                    const member = message.mentions.members?.first();
                    if (!member) {
                        await message.reply('```❌ Please mention a user to kick```');
                        return;
                    }

                    if (!member.voice.channel) {
                        await message.reply('```❌ This user is not in a voice channel```');
                        return;
                    }

                    await member.voice.disconnect();
                    await message.reply(`\`\`\`✅ Kicked ${member.user.tag} from voice channel\`\`\``);
                    break;
                }

                case 'moveall': {
                    const fromChannel = message.guild.channels.cache.get(args[1]);
                    const toChannel = message.guild.channels.cache.get(args[2]);

                    if (!fromChannel || !toChannel || !(fromChannel instanceof VoiceChannel) || !(toChannel instanceof VoiceChannel)) {
                        await message.reply('```❌ Please provide valid voice channel IDs```');
                        return;
                    }

                    let movedCount = 0;
                    for (const member of fromChannel.members.values()) {
                        await member.voice.setChannel(toChannel);
                        movedCount++;
                    }

                    await message.reply(`\`\`\`✅ Moved ${movedCount} members to ${toChannel.name}\`\`\``);
                    break;
                }

                case 'mute': {
                    const member = message.mentions.members?.first();
                    if (!member) {
                        await message.reply('```❌ Please mention a user to mute```');
                        return;
                    }

                    if (!member.voice.channel) {
                        await message.reply('```❌ This user is not in a voice channel```');
                        return;
                    }

                    await member.voice.setMute(true);
                    await message.reply(`\`\`\`✅ Muted ${member.user.tag} in voice channels\`\`\``);
                    break;
                }

                case 'unmute': {
                    const member = message.mentions.members?.first();
                    if (!member) {
                        await message.reply('```❌ Please mention a user to unmute```');
                        return;
                    }

                    if (!member.voice.channel) {
                        await message.reply('```❌ This user is not in a voice channel```');
                        return;
                    }

                    await member.voice.setMute(false);
                    await message.reply(`\`\`\`✅ Unmuted ${member.user.tag} in voice channels\`\`\``);
                    break;
                }

                case 'deafen': {
                    const member = message.mentions.members?.first();
                    if (!member) {
                        await message.reply('```❌ Please mention a user to deafen```');
                        return;
                    }

                    if (!member.voice.channel) {
                        await message.reply('```❌ This user is not in a voice channel```');
                        return;
                    }

                    await member.voice.setDeaf(true);
                    await message.reply(`\`\`\`✅ Deafened ${member.user.tag} in voice channels\`\`\``);
                    break;
                }

                case 'undeafen': {
                    const member = message.mentions.members?.first();
                    if (!member) {
                        await message.reply('```❌ Please mention a user to undeafen```');
                        return;
                    }

                    if (!member.voice.channel) {
                        await message.reply('```❌ This user is not in a voice channel```');
                        return;
                    }

                    await member.voice.setDeaf(false);
                    await message.reply(`\`\`\`✅ Undeafened ${member.user.tag} in voice channels\`\`\``);
                    break;
                }

                case 'move': {
                    const member = message.mentions.members?.first();
                    const channelId = args[2];
                    const channel = message.guild.channels.cache.get(channelId);

                    if (!member || !channel || !(channel instanceof VoiceChannel)) {
                        await message.reply('```❌ Please mention a user and provide a valid voice channel ID```');
                        return;
                    }

                    if (!member.voice.channel) {
                        await message.reply('```❌ This user is not in a voice channel```');
                        return;
                    }

                    await member.voice.setChannel(channel);
                    await message.reply(`\`\`\`✅ Moved ${member.user.tag} to ${channel.name}\`\`\``);
                    break;
                }

                case 'join': {
                    const channelId = args[1];
                    const channel = message.guild.channels.cache.get(channelId);

                    if (!channel || !(channel instanceof VoiceChannel)) {
                        await message.reply('```❌ Please provide a valid voice channel ID```');
                        return;
                    }

                    try {
                        const connection = await client.voice.joinChannel(channel, {
                            selfMute: false,
                            selfDeaf: false,
                            selfVideo: false
                        });

                        if (connection) {
                            await message.reply(`\`\`\`✅ Successfully joined ${channel.name}\`\`\``);
                        } else {
                            await message.reply('```❌ Failed to join voice channel```');
                        }
                    } catch (error) {
                        Logger.error(`Failed to join voice channel: ${(error as Error).message}`);
                        await message.reply('```❌ Failed to join voice channel```');
                    }
                    break;
                }

                case 'leave': {
                    const voiceConnection = message.guild.me?.voice;
                    if (!voiceConnection?.channelId) {
                        await message.reply('```❌ I am not in a voice channel```');
                        return;
                    }

                    try {
                        await voiceConnection.disconnect();
                        await message.reply('```✅ Successfully left voice channel```');
                    } catch (error) {
                        Logger.error(`Failed to leave voice channel: ${(error as Error).message}`);
                        await message.reply('```❌ Failed to leave voice channel```');
                    }
                    break;
                }

                case 'limit': {
                    const limit = parseInt(args[1]);
                    const channelId = args[2];
                    const channel = message.guild.channels.cache.get(channelId);

                    if (!channel || !(channel instanceof VoiceChannel)) {
                        await message.reply('```❌ Please provide a valid voice channel ID```');
                        return;
                    }

                    if (isNaN(limit) || limit < 0 || limit > 99) {
                        await message.reply('```❌ Please provide a valid limit between 0 and 99```');
                        return;
                    }

                    await channel.setUserLimit(limit);
                    await message.reply(`\`\`\`✅ Set user limit for ${channel.name} to ${limit}\`\`\``);
                    break;
                }

                case 'help': {
                    await message.channel.send(`Voice Commands:
    .vckick <user> - Kick user from voice channel
    .vcmoveall <from channel> <to channel> - Move all users
    .vcmute <user> - Mute user
    .vcunmute <user> - Unmute user
    .vcdeafen <user> - Deafen user
    .vcundeafen <user> - Undeafen user
    .vcmove <user> <channel> - Move user to channel
    .vcjoin <channel> - Join voice channel
    .vcleave - Leave voice channel
    .vclimit <limit> <channel> - Set user limit`);
                    break;
                }

                default: {
                    await message.reply('```❌ Unknown voice command.```');
                }
            }

        } catch (error) {
            Logger.error(`Error in voice command: ${(error as Error).message}`);
            await message.reply('```❌ An error occurred while executing voice command```');
        }
    }
};

export default command;
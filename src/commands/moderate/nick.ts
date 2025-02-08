import { Message, Client, WebEmbed } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';
import Logger from '../../modules/Logger';

const command: Command = {
    name: 'nick',
    description: 'Manage user nicknames',
    category: 'Moderation',
    aliases: ['nickname'],
    cooldown: 5,
    usage: '.nick <set/reset/random> <@user> [nickname]',
    
    async execute(message: Message, args: string[], client: Client): Promise<void> {
        try {
            if (!message.guild) {
                await message.reply('```❌ This command can only be used in a server```');
                return;
            }

            if (!args[0]) {
                await message.reply('```Usage:\n' +
                    '.nick set @user [nickname] - Set user\'s nickname\n' +
                    '.nick reset @user - Reset user\'s nickname\n' +
                    '.nick random @user - Set random nickname```');
                return;
            }

            const action = args[0].toLowerCase();
            const member = message.mentions.members?.first();

            if (!member) {
                await message.reply('```❌ Please mention a user```');
                return;
            }

            if (!member.manageable) {
                await message.reply('```❌ I cannot manage this user\'s nickname```');
                return;
            }

            switch (action) {
                case 'set': {
                    const newNick = args.slice(2).join(' ');
                    if (!newNick) {
                        await message.reply('```❌ Please provide a new nickname```');
                        return;
                    }

                    if (newNick.length > 32) {
                        await message.reply('```❌ Nickname must be 32 characters or less```');
                        return;
                    }

                    await member.setNickname(newNick);
                    
                    const embed = new WebEmbed()
                        .setColor('#00ff00')
                        .setTitle('Nickname Changed')
                        .setDescription(`Changed ${member.user.username}'s nickname to ${newNick}`);

                    await message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
                    break;
                }

                case 'reset': {
                    const oldNick = member.nickname;
                    await member.setNickname(null);
                    
                    const embed = new WebEmbed()
                        .setColor('#ffff00')
                        .setTitle('Nickname Reset')
                        .setDescription(`Reset ${member.user.username}'s nickname ${oldNick ? `from ${oldNick}` : ''}`);

                    await message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
                    break;
                }

                case 'random': {
                    const adjectives = ['Sigma', 'Maxxing', 'Alpha', 'Skibidi', 'Ohio', 'Rizzler'];
                    const nouns = ['Toilet', 'Skibidi', 'Wolf', 'Kukuri'];
                    
                    const randomNick = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
                    
                    await member.setNickname(randomNick);
                    
                    const embed = new WebEmbed()
                        .setColor('#0099ff')
                        .setTitle('Random Nickname Set')
                        .setDescription(`Changed ${member.user.username}'s nickname to ${randomNick}`);

                    await message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
                    break;
                }

                default: {
                    await message.reply('```❌ Invalid action. Use .nick for help```');
                }
            }

        } catch (error) {
            Logger.error(`Error in nick command: ${(error as Error).message}`);
            await message.reply('```❌ An error occurred while managing nickname```');
        }
    }
};

export default command;
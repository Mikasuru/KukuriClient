const { Client, GatewayIntentBits, Events, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ]
});

const db = new QuickDB();
const configPath = path.join('..', 'src', 'config', 'Config.json');

async function LoadConfig() {
    try {
        const data = await fs.readFile(configPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error loading config:', err);
        throw err;
    }
}

async function SaveConfig(config) {
    try {
        await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
    } catch (err) {
        console.error('Error saving config:', err);
        throw err;
    }
}

async function UpdateConfig(userId, token, prefix = '.') {
    try {
        const config = await LoadConfig();
        const tokenIndex = config.tokens.findIndex(t => t.token === token);
        
        if (tokenIndex !== -1) { // Update existing token
            config.tokens[tokenIndex] = {
                token,
                ownerId: userId,
                prefix,
                allowedUsers: []
            };
        } else { // Add new token
            config.tokens.push({
                token,
                ownerId: userId,
                prefix,
                allowedUsers: []
            });
        }
        
        await SaveConfig(config);
        return true;
    } catch (err) {
        console.error('Error updating config:', err);
        return false;
    }
}

async function TokenRemove(userId) {
    try {
        const config = await LoadConfig();
        config.tokens = config.tokens.filter(t => t.ownerId !== userId);
        await SaveConfig(config);
        return true;
    } catch (err) {
        console.error('Error removing token from config:', err);
        return false;
    }
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith('!')) return; // Prefix

    const args = message.content.slice(1).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    switch (command) { // Using case switch
        case 'add':
            await AddToken(message, args);
            break;
        case 'remove':
            await RemoveToken(message);
            break;
        case 'status':
            await StatusMonitor(message);
            break;
        case 'help':
            await HelpCmd(message);
            break;
    }
});

async function AddToken(message) {
    try {
        const checkData = await db.get(`token_${message.author.id}`);
        if (checkData) {
            await message.author.send('You already have a token registered. Please use `!remove` first to add a new token.');
            return;
        }

        try {
            await message.delete();
        } catch (err) {
            console.error('Could not delete message:', err);
        }

        // Private channel
        const channel = await message.guild.channels.create({
            name: `token-setup-${message.author.username}`,
            type: 0, // Text
            permissionOverwrites: [
                {
                    id: message.guild.id, // @everyone role
                    deny: ['ViewChannel'],
                },
                {
                    id: message.author.id,
                    allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
                },
                {
                    id: client.user.id,
                    allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
                },
            ],
        });

        // Send instructions
        await channel.send(`${message.author}, please provide your token in this secure channel.`);

        // Create message collector
        const filter = m => m.author.id === message.author.id;
        const tokenCollector = channel.createMessageCollector({ filter, time: 300000 }); // 5m

        let token = null;
        let prefix = null;

        tokenCollector.on('collect', async (msg) => {
            if (!token) {
                token = msg.content;
                await channel.send(`Token received. Now please provide your preferred prefix (or type 'default' for '.')`);
                return;
            }

            if (!prefix) {
                prefix = msg.content.toLowerCase() === 'default' ? '.' : msg.content;
                tokenCollector.stop('completed');
            }
        });

        tokenCollector.on('end', async (collected, reason) => {
            if (reason === 'time') {
                await channel.send('Token setup timed out. Please try again using !add');
            } else if (reason === 'completed') {
                try {
                    const config = await LoadConfig();
                    const tokenFound = config.tokens.some(t => t.token === token);
                    if (tokenFound) {
                        await channel.send('This token is already registered by another user.');
                    } else {
                        // Update config and database
                        const configUpdated = await UpdateConfig(
                            message.author.id,
                            token,
                            prefix
                        );

                        if (configUpdated) {
                            await db.set(`token_${message.author.id}`, {
                                token: token,
                                userId: message.author.id,
                                prefix: prefix,
                                status: 'active',
                                lastUpdated: new Date().toISOString()
                            });

                            await channel.send('Token setup completed successfully! Channel will be deleted in 5 seconds.');
                        } else {
                            await channel.send('Failed to update configuration. Please try again.');
                        }
                    }
                } catch (error) {
                    console.error('Error in token setup:', error);
                    await channel.send('An error occurred during setup. Please try again.');
                }
            }

            // Delete the channel after a delay
            setTimeout(() => {
                channel.delete().catch(console.error);
            }, 5000);
        });

    } catch (err) {
        console.error('Error in token setup:', err);
        await message.author.send('An error occurred during the token setup process. Please try again.');
    }
}

async function RemoveToken(message) {
    try {
        const TokenData = await db.get(`token_${message.author.id}`);
        
        if (!TokenData) {
            await message.reply('No token found!');
            return;
        }

        await TokenRemove(message.author.id);
        await db.delete(`token_${message.author.id}`);
        
        await message.reply('Token removed successfully!');
        
    } catch (err) {
        console.error('Error removing token:', err);
        await message.reply('Failed to remove token. Please try again.');
    }
}

async function StatusMonitor(message) {
    try {
        const TokenData = await db.get(`token_${message.author.id}`);
        
        if (!TokenData) {
            await message.reply('No token found!');
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle('Token Status')
            .setDescription(`
                Status: ${TokenData.status}
                Prefix: ${TokenData.prefix}
                Last Updated: ${new Date(TokenData.lastUpdated).toLocaleString()}
            `)
            .setColor(TokenData.status === 'active' ? '#00ff00' : '#ff0000')
            .setTimestamp();

        await message.reply({ embeds: [embed] });
        
    } catch (err) {
        console.error('Error checking status:', err);
        await message.reply('Failed to get status. Please try again.');
    }
}

async function HelpCmd(message) {
    const embed = new EmbedBuilder()
        .setTitle('Available Commands')
        .setDescription(`
            \`!add <token> [prefix]\` - Add or update your token
            \`!remove\` - Remove your token
            \`!help\` - Show this help message
        `)
        .setColor('#0099ff')
        .setTimestamp();

    await message.reply({ embeds: [embed] });
}

client.login(process.env.BOT_TOKEN);

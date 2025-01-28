const { Client, GatewayIntentBits, Events, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
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

async function AddToken(message, args) {
    if (!args[0]) {
        await message.reply('Please provide a token!');
        return;
    }
    try {
        try {
            await message.delete();
        } catch (err) {
            console.error('Could not delete message:', err);
        }

        const CheckData = await db.get(`token_${message.author.id}`);
        if (CheckData) {
            await message.author.send('You already have a token registered. Please use `!remove` first to add a new token.');
            return;
        }

        const prefix = args[1] || '.';
        
        const config = await LoadConfig();
        const TokenFound = config.tokens.some(t => t.token === args[0]);
        if (TokenFound) {
            await message.author.send('This token is already registered by another user.');
            return;
        }

        const configUpdated = await UpdateConfig(
            message.author.id,
            args[0],
            prefix
        );
        
        if (!configUpdated) {
            throw new Error('Failed to update config');
        }

        await db.set(`token_${message.author.id}`, {
            token: args[0],
            userId: message.author.id,
            prefix: prefix,
            status: 'active',
            lastUpdated: new Date().toISOString()
        });

        await message.author.send('Token added successfully!\nEnjoy Kukuri Client!\nPlease star my repo: https://github.com/Mikasuru/KukuriClient');

    } catch (err) {
        console.error('Error adding token:', err);
        await message.author.send('Failed to add token.\n-# Did you add a token before?');
        return;
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
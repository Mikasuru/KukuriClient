const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { Client: ClientSB } = require('discord.js-selfbot-v13');
const { QuickDB } = require('quick.db');
const fs = require('fs').promises;
const path = require('path');

// Bot configuration
const TOKEN = "MTxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxhlmyRiZqGedtD7yI";
const CLIENT_ID = "114141xxxxxxxxxxxxxxxxxxxxx34615";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const db = new QuickDB();
const configPath = path.join('src', 'config', 'Config.json');

// Define slash commands
const commands = [
    new SlashCommandBuilder()
        .setName('token')
        .setDescription('Manage your token')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a new token')
                .addStringOption(option =>
                    option.setName('token')
                        .setDescription('Your token')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('prefix')
                        .setDescription('Your preferred prefix')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove your token'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Check your token status')),
].map(command => command.toJSON());

// Configure REST with token
const rest = new REST({ version: '10' }).setToken(TOKEN);

// Deploy commands
async function deployCommands() {
    try {
        console.log('Started refreshing application (/) commands.');
        
        // Check if we have required values
        if (!TOKEN || !CLIENT_ID) {
            throw new Error('Missing TOKEN or CLIENT_ID in variables');
        }

        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands },
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error deploying commands:', error);
    }
}

async function loadConfig() {
    try {
        const data = await fs.readFile(configPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error loading config:', err);
        if (err.code === 'ENOENT') {
            const defaultConfig = { tokens: [] };
            await saveConfig(defaultConfig);
            return defaultConfig;
        }
        throw err;
    }
}

async function saveConfig(config) {
    try {
        const dir = path.dirname(configPath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
    } catch (err) {
        console.error('Error saving config:', err);
        throw err;
    }
}

async function updateConfig(userId, token, prefix = '.') {
    try {
        const config = await loadConfig();
        const tokenIndex = config.tokens.findIndex(t => t.token === token);
        
        if (tokenIndex !== -1) {
            config.tokens[tokenIndex] = {
                token,
                ownerId: userId,
                prefix,
                allowedUsers: []
            };
        } else {
            config.tokens.push({
                token,
                ownerId: userId,
                prefix,
                allowedUsers: []
            });
        }
        
        await saveConfig(config);
        return true;
    } catch (err) {
        console.error('Error updating config:', err);
        return false;
    }
}

async function removeToken(userId) {
    try {
        const config = await loadConfig();
        config.tokens = config.tokens.filter(t => t.ownerId !== userId);
        await saveConfig(config);
        return true;
    } catch (err) {
        console.error('Error removing token:', err);
        return false;
    }
}

async function validateToken(token) {
    try {
        const tempClient = new ClientSB();
        
        // Try to login with the token
        await tempClient.login(token);
        const user = tempClient.user; // Get user information
        
        const botInfo = {
            valid: true,
            username: user.username,
            id: user.id,
            avatar: user.avatarURL(),
            type: user.bot ? 'Bot' : 'User',
            createdAt: user.createdAt
        };

        // Properly destroy the client
        await tempClient.destroy();
        
        return botInfo;
    } catch (error) {
        console.error('Token validation error:', error);
        return {
            valid: false,
            error: error.message || 'Failed to validate token'
        };
    }
}

async function handleAddToken(interaction) {
    try {
        // Defer reply first
        await interaction.deferReply({ ephemeral: true });
        
        const checkData = await db.get(`token_${interaction.user.id}`);
        
        if (checkData) {
            await interaction.editReply({ 
                content: 'You already have a token registered. Please remove it first using `/token remove`.'
            });
            return;
        }

        const token = interaction.options.getString('token');
        const prefix = interaction.options.getString('prefix') || '.';

        // Validate token before proceeding
        const validation = await validateToken(token);
        if (!validation.valid) {
            await interaction.editReply({ 
                content: `Invalid token. Error: ${validation.error}`
            });
            return;
        }

        const config = await loadConfig();
        const tokenFound = config.tokens.some(t => t.token === token);
        
        if (tokenFound) {
            await interaction.editReply({ 
                content: 'This token is already registered by another user.'
            });
            return;
        }

        const configUpdated = await updateConfig(
            interaction.user.id,
            token,
            prefix
        );

        if (configUpdated) {
            await db.set(`token_${interaction.user.id}`, {
                token: token,
                userId: interaction.user.id,
                prefix: prefix,
                status: 'active',
                lastUpdated: new Date().toISOString(),
                botInfo: validation
            });

            await interaction.editReply({ 
                content: 'Token setup completed successfully!'
            });
        } else {
            await interaction.editReply({ 
                content: 'Failed to update configuration. Please try again.'
            });
        }
    } catch (error) {
        console.error('Error in token setup:', error);
        if (interaction.deferred) {
            await interaction.editReply({ 
                content: 'An error occurred during setup. Please try again.'
            });
        }
    }
}

async function handleRemoveToken(interaction) {
    try {
        await interaction.deferReply({ ephemeral: true });
        const tokenData = await db.get(`token_${interaction.user.id}`);
        
        if (!tokenData) {
            await interaction.editReply({ 
                content: 'No token found!'
            });
            return;
        }

        await removeToken(interaction.user.id);
        await db.delete(`token_${interaction.user.id}`);
        
        await interaction.editReply({ 
            content: 'Token removed successfully!'
        });
    } catch (err) {
        console.error('Error removing token:', err);
        if (interaction.deferred) {
            await interaction.editReply({ 
                content: 'Failed to remove token. Please try again.'
            });
        }
    }
}

async function handleCheckStatus(interaction) {
    try {
        await interaction.deferReply({ ephemeral: true });
        const tokenData = await db.get(`token_${interaction.user.id}`);
        
        if (!tokenData) {
            await interaction.editReply({ 
                content: 'No token found!'
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle('Token Status')
            .setDescription(`
                Status: ${tokenData.status}
                Prefix: ${tokenData.prefix}
                Account Type: ${tokenData.botInfo?.type || 'N/A'}
                Username: ${tokenData.botInfo?.username || 'N/A'}
                ID: ${tokenData.botInfo?.id || 'N/A'}
                Created: ${tokenData.botInfo?.createdAt ? new Date(tokenData.botInfo.createdAt).toLocaleString() : 'N/A'}
                Last Updated: ${new Date(tokenData.lastUpdated).toLocaleString()}
            `)
            .setThumbnail(tokenData.botInfo?.avatar || null)
            .setColor(tokenData.status === 'active' ? '#00ff00' : '#ff0000')
            .setTimestamp();

        await interaction.editReply({ 
            embeds: [embed]
        });
    } catch (err) {
        console.error('Error checking status:', err);
        if (interaction.deferred) {
            await interaction.editReply({ 
                content: 'Failed to get status. Please try again.'
            });
        }
    }
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    deployCommands();
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'token') {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'add':
                await handleAddToken(interaction);
                break;
            case 'remove':
                await handleRemoveToken(interaction);
                break;
            case 'status':
                await handleCheckStatus(interaction);
                break;
        }
    }
});

client.login(TOKEN);

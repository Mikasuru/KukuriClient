import { Client, Message } from 'discord.js-selfbot-v13';

export interface TokenConfig {
    token: string;
    ownerId: string;
    prefix: string;
    allowedUsers?: string[];
}

export interface BotSettings {
    prefix: string;
    botAdmins: string[];
}

export interface GeneralSettings {
    ownerId: string;
    showLoadCommands: boolean;
    enableNsfw: boolean;
    enableDelete: boolean;
    showStartMessage: boolean;
}

export interface CommandSettings {
    deleteExecuted: boolean;
    deleteInTime: boolean;
    secondToDelete: number;
}

export interface EmbedSettings {
    colors: {
        primary: string;
        success: string;
        error: string;
        warning: string;
    };
    footer: {
        text: string;
        iconUrl: string | null;
    };
}

export interface NotificationSettings {
    enabled: boolean;
    webhook: string;
}

export interface Config {
    tokens: TokenConfig[];
    botSettings: BotSettings;
    generalSettings: GeneralSettings;
    commandSettings: CommandSettings;
    embedSettings: EmbedSettings;
    notificationSettings: NotificationSettings;
    commands: Record<string, any>;
}

export interface Command {
    name: string;
    description: string;
    category: string;
    aliases?: string[];
    cooldown?: number;
    permissions?: string[];
    usage?: string;
    execute: (message: Message, args: string[], client: Client) => Promise<Message | void>;
}
import { Client, Message, ActivityType } from 'discord.js-selfbot-v13';

export interface Command {
    name: string;
    description: string;
    category: string;
    aliases?: string[];
    cooldown?: number;
    permissions?: string[];
    usage?: string;
    execute: (message: Message, args: string[], client: Client) => Promise<Message | void>;
    init?: (client: Client) => void;
}

export interface TokenConfig {
    token: string;
    ownerId: string;
    prefix: string;
    allowedUsers?: string[];
}

export interface Config {
    tokens: TokenConfig[];
    botSettings: {
        prefix: string;
        botAdmins: string[];
    };
    generalSettings: {
        ownerId: string;
        showLoadCommands: boolean;
        enableNsfw: boolean;
        enableDelete: boolean;
        showStartMessage: boolean;
    };
    commandSettings: {
        deleteExecuted: boolean;
        deleteInTime: boolean;
        secondToDelete: number;
    };
    embedSettings: {
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
    };
    notificationSettings: {
        enabled: boolean;
        webhook: string;
    };
    presenceSettings?: {
        enabled: boolean;
        status: 'online' | 'idle' | 'dnd' | 'invisible';
        activities: string[];
        rotateInterval: number;
        activityType: ActivityType;
    };
    commands: Record<string, any>;
}
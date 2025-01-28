import { Client, Message, Collection } from 'discord.js-selfbot-v13';

// Command Types
export type CommandExecute = (message: Message, args: string[], client: Client) => Promise<void>;
export type CommandInit = (client: Client) => void;

export interface CommandOptions {
    name: string;
    description: string;
    category: string;
    aliases?: string[];
    cooldown?: number;
    permissions?: string[];
    usage?: string;
    nsfw?: boolean;
    adminOnly?: boolean;
    enabled?: boolean;
}

export interface Command extends CommandOptions {
    execute: CommandExecute;
    init?: CommandInit;
}

// Configuration Types
export interface BotSettings {
    token: string;
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

export interface NotificationSettings {
    enabled: boolean;
    webhook: string;
}

export interface ResourceConfig {
    messages: {
        [key: string]: string[];
    };
    emoji: {
        [key: string]: string;
    };
    colors: {
        [key: string]: string;
    };
}

// Logger Types
export type LogLevel = 'info' | 'warning' | 'error' | 'debug';

export interface LoggerOptions {
    saveToFile?: boolean;
    logLevel?: LogLevel;
    logFormat?: string;
}

export interface LogEntry {
    timestamp: Date;
    level: LogLevel;
    message: string;
    meta?: Record<string, any>;
}

// Resource Types
export interface Resource<T> {
    get: (key: string) => T | undefined;
    getAll: () => Map<string, T>;
    set: (key: string, value: T) => void;
    remove: (key: string) => boolean;
    clear: () => void;
}

// Error Types
export interface CustomError extends Error {
    code?: string;
    details?: Record<string, any>;
}

// Event Types
export interface EventOptions {
    name: string;
    once?: boolean;
    enabled?: boolean;
}

export interface Event extends EventOptions {
    execute: (...args: any[]) => Promise<void>;
}

// Cache Types
export interface CacheOptions {
    maxSize?: number;
    ttl?: number;
}

export interface CacheEntry<T> {
    value: T;
    timestamp: number;
}

// Utility Types
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type AsyncFunction<T = void> = (...args: any[]) => Promise<T>;

export type Constructor<T> = new (...args: any[]) => T;

export interface Result<T, E = Error> {
    success: boolean;
    data?: T;
    error?: E;
}
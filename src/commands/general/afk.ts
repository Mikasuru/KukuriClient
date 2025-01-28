import { Message, Client, WebhookClient } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';
import fs from 'fs/promises';
import path from 'path';
import Logger from '../../modules/Logger';

interface AFKConfig {
    afk: boolean;
    reason: string;
    startTime: number | null;
    afkKeywords: string[];
}

export class AFKManager {
    private static instance: AFKManager;
    private configPath: string;
    private config: any;
    private isAfk: boolean;
    private startTime: number | null;
    private reason: string;
    private recentResponses: Map<string, number>;

    private constructor() {
        this.configPath = path.join(__dirname, '..', '..', 'config', 'Config.json');
        this.config = require(this.configPath);
        this.isAfk = false;
        this.startTime = null;
        this.reason = '';
        this.recentResponses = new Map();

        // Initialize config if not exists
        if (!this.config.commands) {
            this.config.commands = {};
        }
        
        if (!this.config.commands.afk) {
            this.config.commands.afk = {
                enabled: false,
                reason: '',
                startTime: null,
                afkKeywords: [
                    "I'm currently AFK",
                    "I'm away right now",
                    "I'll be back soon"
                ]
            };
        }

        // Load existing AFK state
        this.isAfk = this.config.commands.afk.enabled || false;
        this.startTime = this.config.commands.afk.startTime || null;
        this.reason = this.config.commands.afk.reason || '';
    }

    public static getInstance(): AFKManager {
        if (!AFKManager.instance) {
            AFKManager.instance = new AFKManager();
        }
        return AFKManager.instance;
    }

    public toggleAFK(reason: string = ''): void {
        this.isAfk = !this.isAfk;
        if (this.isAfk) {
            this.startTime = Date.now();
            this.reason = reason;
        } else {
            this.startTime = null;
            this.reason = '';
            this.recentResponses.clear();
        }
        
        this.config.commands.afk = {
            ...this.config.commands.afk,
            enabled: this.isAfk,
            reason: this.reason,
            startTime: this.startTime
        };
        
        this.saveConfig();
        Logger.info(`AFK Status changed to: ${this.isAfk ? 'Enabled' : 'Disabled'}`);
    }

    private getAfkDuration(): string {
        if (!this.startTime) return '';
        const duration = Date.now() - this.startTime;
        const seconds = Math.floor(duration / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    public formatResponse(): string {
        const randomResponse = this.getRandomResponse();
        const duration = this.getAfkDuration();
        const components = [randomResponse];
        
        if (this.reason) {
            components.push(`Reason: ${this.reason}`);
        }
        components.push(`AFK duration: ${duration}`);
        
        return components.join('\n');
    }

    private getRandomResponse(): string {
        const responses = this.config.commands.afk.afkKeywords;
        return responses[Math.floor(Math.random() * responses.length)];
    }

    private async saveConfig(): Promise<void> {
        try {
            await fs.writeFile(
                this.configPath,
                JSON.stringify(this.config, null, 2),
                'utf-8'
            );
        } catch (error) {
            Logger.error(`Failed to save AFK config: ${(error as Error).message}`);
        }
    }

    public async sendWebhookNotification(message: Message, response: string): Promise<void> {
        if (!this.config.notificationSettings?.enabled || !this.config.notificationSettings?.webhook) {
            return;
        }

        try {
            const webhook = new WebhookClient({ url: this.config.notificationSettings.webhook });
            const content = [
                '```',
                'AFK Notification',
                '================',
                `From: ${message.author.tag}`,
                `Channel: ${message.channel.type === 'DM' ? 'Direct Message' : message.channel.name}`,
                `Message: ${message.content}`,
                `Response: ${response}`,
                '```'
            ].join('\n');

            await webhook.send({ content });
        } catch (error) {
            Logger.error(`Failed to send webhook notification: ${(error as Error).message}`);
        }
    }

    public shouldRespond(userId: string, channelId: string): boolean {
        const key = `${userId}-${channelId}`;
        const now = Date.now();
        const lastResponse = this.recentResponses.get(key);

        if (!lastResponse || (now - lastResponse) > 60000) {
            this.recentResponses.set(key, now);
            return true;
        }

        return false;
    }

    public get getIsAfk(): boolean {
        return this.isAfk;
    }
}

const manager = AFKManager.getInstance();

const command: Command = {
    name: 'afk',
    description: 'Toggle AFK mode with optional reason',
    category: 'General',
    aliases: ['away'],
    
    async execute(message: Message, args: string[], client: Client): Promise<void> {
        const reason = args.join(' ');
        manager.toggleAFK(reason);

        // Always send status message
        const status = manager.getIsAfk ? 'enabled' : 'disabled';
        const reasonText = reason ? ` with reason: ${reason}` : '';
        await message.channel.send(`\`\`\`AFK mode has been ${status}${reasonText}\`\`\``);
    }
};

export default command;
import { Message } from 'discord.js-selfbot-v13';
import Logger from './Logger';

export class MessageStore {
    private static instance: MessageStore;
    private messages: Map<string, Map<string, Message[]>>; 
    private readonly maxStoredMessages = 10;

    private constructor() {
        this.messages = new Map();
    }

    public static getInstance(): MessageStore {
        if (!MessageStore.instance) {
            MessageStore.instance = new MessageStore();
        }
        return MessageStore.instance;
    }

    public storeMessage(ownerId: string, channelId: string, message: Message): void {
        try {
            let ownerMessages = this.messages.get(ownerId);
            if (!ownerMessages) {
                ownerMessages = new Map();
                this.messages.set(ownerId, ownerMessages);
            }

            const channelMessages = ownerMessages.get(channelId) || [];

            channelMessages.unshift(message);
            if (channelMessages.length > this.maxStoredMessages) {
                channelMessages.pop();
            }

            ownerMessages.set(channelId, channelMessages);
        } catch (error) {
            Logger.error(`Error storing message: ${(error as Error).message}`);
        }
    }

    public getMessages(ownerId: string, channelId: string): Message[] {
        return this.messages.get(ownerId)?.get(channelId) || [];
    }

    public clear(): void {
        this.messages.clear();
    }
}

export default MessageStore;
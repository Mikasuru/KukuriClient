import { Message, TextChannel, DMChannel } from "discord.js-selfbot-v13";
import { Logger } from "./Logger"; // Assuming Logger is in the same directory

/**
 * Sends a temporary reply message that will be deleted after a specified duration.
 * @param message The original message to reply to.
 * @param content The content of the reply.
 * @param duration Duration in milliseconds before deleting the reply. Default is 3000ms.
 */
export async function SendTempRep(message: Message, content: string, duration: number = 3000): Promise<void> {
    try {
        const reply = await message.reply(content);
        if (reply && reply.deletable) {
            setTimeout(() => {
                reply.delete().catch(err => {
                    // Handle deletion error
                    const errMsg = (err instanceof Error) ? err.message : String(err);
                    Logger.warn(`Failed to delete temporary reply: ${errMsg}`);
                });
            }, duration);
        }
    } catch (error) {
        // Handle sending error
        const errMsg = (error instanceof Error) ? error.message : String(error);
        Logger.error(`Failed to send temporary reply: ${errMsg}`);
    }
}

/**
 * Sends a reply message that can be edited later.
 * @param message The original message to reply to.
 * @param initialContent The initial content of the reply message.
 * @returns The sent Message object, or null if sending failed.
 */
export async function SendEditRep(message: Message, initialContent: string): Promise<Message | null> {
    try {
        const reply = await message.reply(initialContent);
        return reply;
    } catch (error) {
        // Handle sending error
        const errMsg = (error instanceof Error) ? error.message : String(error);
        Logger.error(`Failed to send editable reply: ${errMsg}`);
        return null;
    }
}

/**
 * Safely deletes a message (doesn't throw an error if deletion fails).
 * @param message The message to delete.
 * @param reason Optional reason for audit logs (if applicable).
 */
export async function SafeDelMsg(message: Message | null | undefined, reason?: string): Promise<void> {
    if (message && message.deletable) {
        try {
            await message.delete();
        } catch (error) {
            // Handle deletion error
            const errMsg = (error instanceof Error) ? error.message : String(error);
            Logger.warn(`Failed to safely delete message ${message.id}: ${errMsg}`);
        }
    }
}

/**
 * Safely deletes the command invocation message.
 * @param message The command message to delete.
 * @param delay Delay in milliseconds before deleting. Default is 0.
 */
export function SafeDelCmd(message: Message, delay: number = 0): void {
    if (delay > 0) {
        setTimeout(() => SafeDelMsg(message), delay);
    } else {
        SafeDelMsg(message);
    }
}


/**
 * Fetches messages in a channel with error handling.
 * @param channel The channel to fetch messages from.
 * @param limit Maximum number of messages to fetch (default 100).
 * @returns A collection of messages, or null if fetching failed.
 */
export async function FetchChMsg(channel: TextChannel | DMChannel, limit: number = 100): Promise<Map<string, Message> | null> {
    try {
        const messages = await channel.messages.fetch({ limit });
        return messages;
    } catch (error) {
        // Handle fetching error
        const errMsg = (error instanceof Error) ? error.message : String(error);
        Logger.error(`Failed to fetch messages in channel ${channel.id}: ${errMsg}`);
        return null;
    }
}

/**
 * Formats content into a Markdown code block.
 * @param content Message content inside the code block.
 * @param language Code block language ('ts', 'js', 'json', or leave blank).
 * @returns The formatted code block string.
 */
export function CodeBlock(content: string, language?: string): string {
    return `\`\`\`${language || ''}\n${content}\n\`\`\``;
}

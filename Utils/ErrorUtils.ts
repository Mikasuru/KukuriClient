import { Message } from "discord.js-selfbot-v13";
import { Logger } from "./Logger";

/**
 * Handles errors occurring within command execution by logging and sending a generic reply.
 * @param error The error object caught (expected to be 'unknown').
 * @param commandName The name of the command where the error occurred.
 * @param message The message object that triggered the command.
 * @param replyMessage Optional custom error message for the user.
 */
export async function HandleError(
    error: unknown,
    commandName: string,
    message: Message,
    replyMessage: string = `An error occurred while executing the '${commandName}' command.`
): Promise<void> {
    let errorMessage = 'Unknown error';
    let errorStack = '';

    if (error instanceof Error) {
        errorMessage = error.message;
        errorStack = error.stack || '';
    } else if (typeof error === 'string') {
        errorMessage = error;
    } else if (typeof error === 'object' && error !== null) {
        errorMessage = String((error as any).message || JSON.stringify(error));
    }

    Logger.error(`Error executing command '${commandName}': ${errorMessage}\n${errorStack}`);

    try {
        await message.reply(replyMessage).catch(err => {
            const replyErr = err instanceof Error ? err.message : String(err);
            Logger.error(`Failed to send error reply: ${replyErr}`);
        });
    } catch (replyError) {
        const replyFailErr = replyError instanceof Error ? replyError.message : String(replyError);
        Logger.error(`Failed to send error reply after command error: ${replyFailErr}`);
    }
}

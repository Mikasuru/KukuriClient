import { Message, User, GuildMember, TextChannel, Channel } from "discord.js-selfbot-v13";
import { ClientInit } from "../Types/Client";
import { Logger } from "./Logger";

/**
 * Attempts to find a User from an argument (mention or ID), or defaults to the message author.
 * @param client Client instance.
 * @param arg Argument string (mention or ID).
 * @param message The original message object.
 * @returns The found User object or the message author.
 */
export async function ParseUsr(client: ClientInit, arg: string | undefined, message: Message): Promise<User> {
    if (!arg) return message.author;

    const mentions = message.mentions.users;
    if (mentions.size > 0) {
        const firstMention = mentions.first();
        if (firstMention) return firstMention;
    }

    try {
        const fetchedUser = await client.users.fetch(arg);
        if (fetchedUser) return fetchedUser;
    } catch {
        // Ignore error if ID is invalid
    }

    return message.author;
}

/**
 * Attempts to find a GuildMember from an argument (mention or ID). Must be used within a Guild context.
 * @param message The original message object (must be in a guild).
 * @param arg Argument string (mention or ID).
 * @returns The found GuildMember object, or null if not found or not in a guild.
 */
export async function ParseMbr(message: Message, arg: string | undefined): Promise<GuildMember | null> {
    if (!message.guild || !arg) return null;

    const mentions = message.mentions.members;
    if (mentions && mentions.size > 0) {
        const firstMention = mentions.first();
        if (firstMention) return firstMention;
    }

    try {
        const fetchedMember = await message.guild.members.fetch(arg);
        if (fetchedMember) return fetchedMember;
    } catch {
        // Ignore error if ID is invalid
    }

    return null;
}

/**
 * Ensures the command is used within a Guild (Server) context. Sends a reply if not.
 * @param message The message object.
 * @param replyMessage Optional custom message to send if not in a guild.
 * @returns True if in a guild, false otherwise.
 */
export async function EnsureGC(message: Message, replyMessage: string = "This command can only be used in a server."): Promise<boolean> {
    if (!message.guild) {
        await message.reply(replyMessage).catch(err => {
             const errMsg = (err instanceof Error) ? err.message : String(err);
             Logger.error(`Failed to send guild context reply: ${errMsg}`);
        });
        return false;
    }
    return true;
}

/**
 * Checks if the Client User can manage the specified Member (Kick, Ban, Nickname).
 * @param message The message object.
 * @param targetMember The GuildMember to check.
 * @param actionName Name of the action for logging/reply (e.g., 'kick', 'ban', 'manage nickname for').
 * @returns True if manageable, false otherwise (sends reply on failure).
 */
export async function CheckManageable(message: Message, targetMember: GuildMember | null, actionName: string = 'manage'): Promise<boolean> {
     if (!targetMember) {
         await message.reply("Please mention a valid member or provide a valid ID.").catch(err => {
             const errMsg = (err instanceof Error) ? err.message : String(err);
             Logger.error(`Failed to send manageable check reply (no target): ${errMsg}`);
         });
         return false;
     }
     if (!targetMember.manageable) {
         await message.reply(`I cannot ${actionName} this member.`).catch(err => {
             const errMsg = (err instanceof Error) ? err.message : String(err);
             Logger.error(`Failed to send manageable check reply (not manageable): ${errMsg}`);
         });
         return false;
     }
     return true;
}

/**
 * Checks if the Client User can kick the specified Member.
 * @param message The message object.
 * @param targetMember The GuildMember to check.
 * @returns True if kickable, false otherwise (sends reply on failure).
 */
export async function CheckKickable(message: Message, targetMember: GuildMember | null): Promise<boolean> {
    if (!targetMember) {
        await message.reply("Please mention a valid member or provide a valid ID.").catch(err => {
             const errMsg = (err instanceof Error) ? err.message : String(err);
             Logger.error(`Failed to send kickable check reply (no target): ${errMsg}`);
        });
        return false;
    }
    if (!targetMember.kickable) {
        await message.reply("I cannot kick this member.").catch(err => {
             const errMsg = (err instanceof Error) ? err.message : String(err);
             Logger.error(`Failed to send kickable check reply (not kickable): ${errMsg}`);
        });
        return false;
    }
    return true;
}

/**
 * Checks if the Client User can ban the specified Member.
 * @param message The message object.
 * @param targetMember The GuildMember to check.
 * @returns True if bannable, false otherwise (sends reply on failure).
 */
export async function CheckBanable(message: Message, targetMember: GuildMember | null): Promise<boolean> {
    if (!targetMember) {
        await message.reply("Please mention a valid member or provide a valid ID.").catch(err => {
             const errMsg = (err instanceof Error) ? err.message : String(err);
             Logger.error(`Failed to send bannable check reply (no target): ${errMsg}`);
        });
        return false;
    }
    if (!targetMember.bannable) {
        await message.reply("I cannot ban this member.").catch(err => {
             const errMsg = (err instanceof Error) ? err.message : String(err);
             Logger.error(`Failed to send bannable check reply (not bannable): ${errMsg}`);
        });
        return false;
    }
    return true;
}

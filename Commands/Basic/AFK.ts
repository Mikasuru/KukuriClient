import { Message } from "discord.js-selfbot-v13";
import { ClientInit } from "../../Types/Client";
import { Logger } from "../../Utils/Logger";
import { HandleError } from "../../Utils/ErrorUtils";
import { SendTempRep } from "../../Utils/MessageUtils";

export default {
  name: "afk",
  description: "Sets your status to AFK or removes it.",
  usage: "afk [reason]",
  execute: async (client: ClientInit, message: Message, args: string[]) => {
    try {
      const userId = message.author.id;

      if (client.afkStatus.has(userId)) {
        client.afkStatus.delete(userId);
        try {
            await client.user?.setAFK(false);
        } catch (discordError) {
            Logger.warn(`Could not automatically unset Discord AFK status: ${discordError}`);
        }
        await SendTempRep(message, "You are no longer AFK.");

      } else {
        const reason = args.join(" ") || "No reason provided.";
        client.afkStatus.set(userId, reason);
         try {
            await client.user?.setAFK(true);
         } catch (discordError) {
             Logger.warn(`Could not automatically set Discord AFK status: ${discordError}`);
         }
        await SendTempRep(message, `You are now AFK. Reason: ${reason}`);
      }
    } catch (error) {
      await HandleError(error, exports.default.name, message);
    }
  }
};

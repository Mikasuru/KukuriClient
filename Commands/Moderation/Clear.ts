import { Message, TextChannel, DMChannel } from "discord.js-selfbot-v13";
import { ClientInit } from "../../Types/Client";
import { FetchChMsg, SafeDelMsg, SendTempRep, SafeDelCmd } from "../../Utils/MessageUtils";
import { HandleError } from "../../Utils/ErrorUtils";
import { ParseIntArg } from "../../Utils/MiscUtils";

export default {
  name: "clear",
  description: "Deletes a specified number of your own messages in the chat.",
  usage: "clear <amount 1-100>",
  execute: async (client: ClientInit, message: Message, args: string[]) => {
    try {
      const amountToDelete = ParseIntArg(args[0], 1, 100);

      if (amountToDelete === null) {
        await SendTempRep(message, `Invalid amount. Usage: ${client.prefix}${exports.default.usage}`);
        return;
      }

      if (!(message.channel instanceof TextChannel || message.channel instanceof DMChannel)) {
         await SendTempRep(message, "Cannot clear messages in this type of channel.");
         return;
      }
      const fetchedMessages = await FetchChMsg(message.channel, 100);

      if (!fetchedMessages) {
        await SendTempRep(message, "Could not fetch messages.");
        return;
      }

      const ownMessages = Array.from(fetchedMessages.values())
        .filter(msg => msg.author.id === client.user?.id && msg.id !== message.id)
        .slice(0, amountToDelete);

      if (ownMessages.length === 0) {
        await SendTempRep(message, "No recent messages found to delete.");
        return;
      }

      let deletedCount = 0;
      for (const msgToDelete of ownMessages) {
        await SafeDelMsg(msgToDelete);
        deletedCount++;
      }

      await SendTempRep(message, `Successfully deleted ${deletedCount} message(s).`);
      SafeDelCmd(message, 3000);

    } catch (error) {
      await HandleError(error, exports.default.name, message);
    }
  },
};
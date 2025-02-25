import { Client, Message } from "discord.js-selfbot-v13";
import { Logger } from "../../Utils/Logger";

export default {
  name: "clear",
  description: "Deletes a specified number of your own messages in the chat.",
  usage: "clear <amount>",
  execute: async (client: Client, message: Message, args: string[]) => {
    if (!args[0] || isNaN(Number(args[0]))) {
      return message.reply(
        "Please provide a valid number of messages to delete. Usage: `!clear <amount>`",
      );
    }

    const Amt = parseInt(args[0]);
    if (Amt < 1 || Amt > 100) {
      return message.reply("Please specify a number between 1 and 100.");
    }

    try {
      const messages = await message.channel.messages.fetch({ limit: 100 });
      const Own = messages
        .filter((msg) => msg.author.id === client.user?.id)
        .first(Amt);

      if (Own.length === 0) {
        return message.reply("No messages found to delete.");
      }

      for (const msg of Own) {
        await msg.delete();
      }

      const Reply = await message.reply(
        `Successfully deleted ${Own.length} message(s).`,
      );
      setTimeout(() => Reply.delete(), 3000);
    } catch (error) {
      Logger.error(`Error in clear command: ${error}`);
      message.reply(
        "Failed to delete messages. Check permissions or try again.",
      );
    }
  },
};

import { Client, Message } from "discord.js-selfbot-v13";
import { Logger } from "../../Utils/Logger";

export default {
  name: "ban",
  description: "Ban a member from the server",
  usage: "ban [@user] [reason]",
  execute: async (client: Client, message: Message, args: string[]) => {
    try {
      const Mem = message.mentions.members?.first();
      if (!Mem) {
        await message.reply("Please mention a valid member.");
        return;
      }

      if (!Mem.bannable) {
        await message.reply("I cannot ban this member.");
        return;
      }

      const reason = args.slice(1).join(" ") || "No reason provided";
      await Mem.ban({ reason });
      await message.channel.send(
        `✅ Banned ${Mem.user.tag} | Reason: ${reason}`,
      );
    } catch (error) {
      Logger.error(`Error in ban command: ${error}`);
      await message.reply("Failed to ban member.");
    }
  },
};

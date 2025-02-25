import { Client, Message } from "discord.js-selfbot-v13";
import { Logger } from "../../Utils/Logger";

export default {
  name: "kick",
  description: "Kick a member from the server",
  usage: "kick [@user] [reason]",
  execute: async (client: Client, message: Message, args: string[]) => {
    try {
      const member = message.mentions.members?.first();
      if (!member) {
        await message.reply("Please mention a valid member.");
        return;
      }

      if (!member.kickable) {
        await message.reply("I cannot kick this member.");
        return;
      }

      const Reason = args.slice(1).join(" ") || "No reason provided";
      await member.kick(Reason);
      await message.channel.send(
        `✅ Kicked ${member.user.tag} | Reason: ${Reason}`,
      );
    } catch (error) {
      Logger.error(`Error in kick command: ${error}`);
      await message.reply("Failed to kick member.");
    }
  },
};

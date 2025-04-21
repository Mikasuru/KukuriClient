import { Client, Message } from "discord.js-selfbot-v13";
import { Logger } from "../../Utils/Logger";

export default {
  name: "unban",
  description: "Unban a user from the server",
  usage: "unban [userID]",
  execute: async (client: Client, message: Message, args: string[]) => {
    try {
      if (!message.guild) {
        await message.reply("This command can only be used in a server");
        return;
      }

      if (!args[0]) {
        await message.reply(
          "Usage: !unban [userID]\nExample: !unban 123456789",
        );
        return;
      }

      try {
        await message.guild.bans.fetch(args[0]);
      } catch {
        await message.reply("Ts user is not banned or the ID is invalid");
        return;
      }

      try {
        await message.guild.members.unban(args[0]);
        await message.channel.send(
          `✅ Successfully unbanned user with ID: ${args[0]}`,
        );
      } catch (error) {
        Logger.error(`Failed to unban user: ${error}`);
        await message.reply(
          "Failed to unban user. They may not be banned or I may not have permission",
        );
      }
    } catch (error) {
      Logger.error(`Error in unban command: ${error}`);
      await message.reply("An error occurred while trying to unban the user");
    }
  },
};

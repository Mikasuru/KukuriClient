import { Client, Message, TextChannel } from "discord.js-selfbot-v13";
import { Logger } from "../../Utils/Logger";

export default {
  name: "slowmode",
  description: "Set channel slowmode duration",
  usage: "slowmode [duration] [#channel]",
  execute: async (client: Client, message: Message, args: string[]) => {
    try {
      if (!message.guild) {
        await message.reply("This command can only be used in a server");
        return;
      }

      if (!args[0]) {
        await message.reply(
          "Usage: !slowmode [duration] [#channel]\nDuration in seconds, or 0 to disable",
        );
        return;
      }

      const duration = parseInt(args[0]);
      if (isNaN(duration) || duration < 0 || duration > 21600) {
        await message.reply(
          "Please provide a valid duration between 0 and 21600 seconds (6 hours)",
        );
        return;
      }

      const channel = (message.mentions.channels.first() ||
        message.channel) as TextChannel;

      if (!channel.isText()) {
        await message.reply("Slowmode can only be set in text channels");
        return;
      }

      await channel.setRateLimitPerUser(duration);
      await message.channel.send(
        duration === 0
          ? `Slowmode has been disabled in ${channel}`
          : `Slowmode has been set to ${duration} seconds in ${channel}`,
      );
    } catch (error) {
      Logger.error(`Error in slowmode command: ${error}`);
      await message.reply("An error occurred while setting slowmode");
    }
  },
};

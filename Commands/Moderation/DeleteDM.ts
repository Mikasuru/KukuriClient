import { Client, Message, DMChannel } from "discord.js-selfbot-v13";
import { Logger } from "../../Utils/Logger";

export default {
  name: "deletedm",
  description: "Delete messages in DMs with a user or all users",
  usage: "deletedm <@user/userid/all>",
  execute: async (client: Client, message: Message, args: string[]) => {
    try {
      if (!args[0]) {
        await message.reply(
          "Usage: !deletedm <@user/userid/all>\nExample: !deletedm @user or !deletedm all",
        );
        return;
      }

      if (args[0].toLowerCase() === "all") {
        const Msg = await message.channel.send(
          "🗑️ Deleting all previous DMs...",
        );
        const DMChannels = client.channels.cache.filter(
          (channel) => channel instanceof DMChannel,
        );
        let DelCount = 0;

        for (const [, channel] of DMChannels) {
          try {
            const messages = await (channel as DMChannel).messages.fetch();
            for (const msg of messages.values()) {
              if (msg.author.id === client.user?.id && msg.deletable) {
                await msg.delete();
                DelCount++;
              }
            }
          } catch (error) {
            Logger.error(
              `Error deleting messages in channel ${channel.id}: ${error}`,
            );
          }
        }

        await Msg.edit(
          `✅ Successfully deleted ${DelCount} messages from all DM channels`,
        );
        return;
      }

      let TargetUser = message.mentions.users.first();
      if (!TargetUser) {
        try {
          TargetUser = await client.users.fetch(args[0]);
        } catch {
          await message.reply("Invalid user ID or mention");
          return;
        }
      }

      const Msg = await message.channel.send(
        `🗑️ Deleting DMs with ${TargetUser.tag}...`,
      );
      try {
        const DMChannel = await TargetUser.createDM();
        const messages = await DMChannel.messages.fetch();
        let DelCount = 0;

        for (const msg of messages.values()) {
          if (msg.author.id === client.user?.id && msg.deletable) {
            await msg.delete();
            DelCount++;
          }
        }

        await Msg.edit(
          `✅ Successfully deleted ${DelCount} messages with ${TargetUser.tag}`,
        );
      } catch (error) {
        Logger.error(`Error deleting DM messages: ${error}`);
        await Msg.edit("Failed to delete DM messages");
      }
    } catch (error) {
      Logger.error(`Error in deletedm command: ${error}`);
      await message.reply("An error occurred while deleting DM messages");
    }
  },
};

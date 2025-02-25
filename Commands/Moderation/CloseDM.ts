import { Client, Message, DMChannel } from "discord.js-selfbot-v13";
import { Logger } from "../../Utils/Logger";

export default {
  name: "closedm",
  description: "Close DM channels with a user or all users",
  usage: "closedm <@user/userid/all>",
  execute: async (client: Client, message: Message, args: string[]) => {
    try {
      if (!args[0]) {
        await message.reply(
          "Usage: !closedm <@user/userid/all>\nExample: !closedm @user or !closedm all",
        );
        return;
      }

      if (args[0].toLowerCase() === "all") {
        const Msg = await message.channel.send("🔒 Closing all DM channels...");
        const DMChannels = client.channels.cache.filter(
          (channel) => channel instanceof DMChannel,
        );
        let Closed = 0;

        for (const [, channel] of DMChannels) {
          try {
            await (channel as DMChannel).delete();
            Closed++;
          } catch (error) {
            Logger.error(`Error closing DM channel ${channel.id}: ${error}`);
          }
        }

        await Msg.edit(`✅ Successfully closed ${Closed} DM channels.`);
        return;
      }

      let Targ = message.mentions.users.first();
      if (!Targ) {
        try {
          Targ = await client.users.fetch(args[0]);
        } catch {
          await message.reply("Invalid user ID or mention");
          return;
        }
      }

      const Msg = await message.channel.send(
        `🔒 Closing DM channel with ${Targ.tag}...`,
      );
      try {
        const DMC = await Targ.createDM();
        await DMC.delete();
        await Msg.edit(`✅ Successfully closed DM channel with ${Targ.tag}`);
      } catch (error) {
        Logger.error(`Error closing DM channel: ${error}`);
        await Msg.edit("Failed to close DM channel");
      }
    } catch (error) {
      Logger.error(`Error in closedm command: ${error}`);
      await message.reply("An error occurred while closing DM channels");
    }
  },
};

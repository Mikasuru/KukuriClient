import { Client, Message } from "discord.js-selfbot-v13";
import { Logger } from "../../Utils/Logger";

export default {
  name: "totalbans",
  description: "Check total bans in server",
  usage: "totalbans",
  execute: async (client: Client, message: Message, args: string[]) => {
    try {
      if (!message.guild) {
        await message.reply("This command can only be used in a server");
        return;
      }

      const Msg = await message.channel.send("🔄 Fetching ban list...");
      try {
        const bans = await message.guild.bans.fetch();

        if (bans.size === 0) {
          await Msg.edit("No banned users found in this server");
          return;
        }

        const Recent = Array.from(bans.values()).slice(0, 10);
        const BanList = Recent.map((ban, index) => {
          const Reason = ban.reason?.length ? ban.reason : "No reason provided";
          return `${index + 1}. ${ban.user.tag} (${ban.user.id})\n   Reason: ${Reason}`;
        }).join("\n\n");

        await Msg.edit(
          `Total Bans: ${bans.size}\n\nRecent Bans:\n${BanList}` +
            (bans.size > 10 ? "\n\nShowing 10 most recent bans" : ""),
        );
      } catch (error) {
        Logger.error(`Error fetching bans: ${error}`);
        await Msg.edit("Failed to fetch ban list");
      }
    } catch (error) {
      Logger.error(`Error in totalbans command: ${error}`);
      await message.reply("An error occurred while fetching server bans");
    }
  },
};

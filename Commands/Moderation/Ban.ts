import { Message } from "discord.js-selfbot-v13";
import { ClientInit } from "../../Types/Client";
import { EnsureGC, ParseMbr, CheckBanable } from "../../Utils/DiscordUtils";
import { HandleError } from "../../Utils/ErrorUtils";
import { SafeDelCmd, SendTempRep } from "../../Utils/MessageUtils";

export default {
  name: "ban",
  description: "Ban a member from the server",
  usage: "ban <@user/userid> [reason]",
  execute: async (client: ClientInit, message: Message, args: string[]) => {
    try {
      if (!await EnsureGC(message)) return;

      const memberToBan = await ParseMbr(message, args[0]);
      if (!memberToBan) {
          await SendTempRep(message, `Invalid user mention or ID. Usage: ${client.prefix}${exports.default.usage}`);
          return;
      }

      if (!await CheckBanable(message, memberToBan)) return;

      const reason = args.slice(1).join(" ") || "No reason provided";
      await memberToBan.ban({ reason });

      await message.channel.send(
        `Banned ${memberToBan.user.tag} | Reason: ${reason}`
      );
      SafeDelCmd(message);

    } catch (error) {
      await HandleError(error, exports.default.name, message, "Failed to ban member.");
    }
  },
};

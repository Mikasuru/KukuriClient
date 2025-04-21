import { Message } from "discord.js-selfbot-v13";
import { ClientInit } from "../../Types/Client";
import { Logger } from "../../Utils/Logger";

import { EnsureGC, ParseMbr, CheckKickable } from "../../Utils/DiscordUtils";
import { HandleError } from "../../Utils/ErrorUtils";
import { SafeDelCmd } from "../../Utils/MessageUtils";

export default {
  name: "kick",
  description: "Kick a member from the server (using utilities)",
  usage: "kick <@user/userid> [reason]",
  execute: async (client: ClientInit, message: Message, args: string[]) => {
    try {
      if (!await EnsureGC(message)) {
        return;
      }

      const memberToKick = await ParseMbr(message, args[0]);
      if (!memberToKick) {
          await message.reply(`Invalid user mention or ID. Usage: ${client.prefix}${exports.default.usage}`);
          return;
      }

      if (!await CheckKickable(message, memberToKick)) {
        return;
      }

      const reason = args.slice(1).join(" ") || "No reason provided";
      await memberToKick.kick(reason);
      await message.channel.send(
        `Kicked ${memberToKick.user.tag} | Reason: ${reason}`,
      );

      SafeDelCmd(message);

    } catch (error) {
      await HandleError(error, exports.default.name, message);
    }
  },
};
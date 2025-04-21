import { Message } from "discord.js-selfbot-v13";
import { ClientInit } from "../../Types/Client";
import { Logger } from "../../Utils/Logger";
import { HandleError } from "../../Utils/ErrorUtils";
import { ParseUsr } from "../../Utils/DiscordUtils";
import { SendTempRep } from "../../Utils/MessageUtils";

export default {
  name: "avatar",
  description: "Displays the avatar of a user.",
  usage: "avatar [@user/userid]",
  execute: async (client: ClientInit, message: Message, args: string[]) => {
    try {
      const targetUser = await ParseUsr(client, args[0], message);

      if (!targetUser) {
         await SendTempRep(message, "Could not find the specified user.");
         return;
      }

      const avatarURL = targetUser.displayAvatarURL({ dynamic: true, size: 4096 });
      await message.reply(avatarURL);

    } catch (error) {
      await HandleError(error, exports.default.name, message);
    }
  },
};

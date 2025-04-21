import { Message } from "discord.js-selfbot-v13";
import { ClientInit } from "../../Types/Client";
import { Logger } from "../../Utils/Logger";
import { CodeBlock } from "../../Utils/MessageUtils";
import { HandleError } from "../../Utils/ErrorUtils";

export default {
  name: "friendcount",
  description: "Get the total number of friends on Discord.",
  usage: "friendcount",
  execute: async (client: ClientInit, message: Message, args: string[]) => {
    try {
      if (!client.user) {
        await message.reply(CodeBlock("Client is not fully initialized yet."));
        return;
      }

      const friends = client.relationships.friendCache;
      const friendCount = friends.size;

      const msgContent = `Friend Information:\n- Total Friends: ${friendCount}`;

      await message.reply(CodeBlock(msgContent));

    } catch (error) {
      await HandleError(error, exports.default.name, message);
    }
  },
};

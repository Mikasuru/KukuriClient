import { Message } from "discord.js-selfbot-v13";
import { ClientInit } from "../../Types/Client";
import { Logger } from "../../Utils/Logger";
import { SendTempRep, CodeBlock } from "../../Utils/MessageUtils";
import { HandleError } from "../../Utils/ErrorUtils";

export default {
  name: "autoreact",
  description: "Automatically reacts to messages with a specified emoji.",
  usage: "autoreact <on|off> [emoji]",
  execute: async (client: ClientInit, message: Message, args: string[]) => {
    try {
      const subCmd = args[0]?.toLowerCase();

      if (subCmd === "on") {
        const emoji = args[1];
        if (!emoji) {
          await SendTempRep(message, CodeBlock(`Please provide an emoji. Usage: ${client.prefix}autoreact on <emoji>`));
          return;
        }
        if (emoji.length > 5 && !emoji.match(/<a?:.+?:\d+>/)) {
             await SendTempRep(message, CodeBlock(`"${emoji}" doesn't look like a valid emoji.`));
             return;
        }

        client.autoReactConfig.enabled = true;
        client.autoReactConfig.emoji = emoji;
        await SendTempRep(message, `Auto react enabled with emoji: ${emoji}`);

      } else if (subCmd === "off") {
        client.autoReactConfig.enabled = false;
        client.autoReactConfig.emoji = "";
        await SendTempRep(message, "Auto react disabled.");

      } else {
        await SendTempRep(message, CodeBlock(`Invalid subcommand. Usage: ${client.prefix}${exports.default.usage}`));
      }
    } catch (error) {
      await HandleError(error, exports.default.name, message);
    }
  },
};

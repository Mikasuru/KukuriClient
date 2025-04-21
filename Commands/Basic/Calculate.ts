import { Message } from "discord.js-selfbot-v13";
import { ClientInit } from "../../Types/Client";
import { Logger } from "../../Utils/Logger";
import { SendTempRep, CodeBlock } from "../../Utils/MessageUtils";

export default {
  name: "calculate",
  description: "Calculates a simple math expression (use with caution).",
  usage: "calculate <expression>",
  execute: async (client: ClientInit, message: Message, args: string[]) => {

    if (args.length === 0) {
      await SendTempRep(message, `Please provide a math expression. Usage: ${client.prefix}${exports.default.usage}`);
      return;
    }

    const expression = args.join(" ");

    try {
      const result = eval(expression);

      if (typeof result === "number" && !isNaN(result)) {
        await message.reply(`Result: ${CodeBlock(result.toString())}`);
      } else {
        await SendTempRep(message, "Invalid math expression or result is not a number.");
      }
    } catch (evalError) {
      Logger.error(`Eval error in calculate command: ${evalError}`);
      await SendTempRep(message, "Error calculating expression. Please check your input.");
    }
  },
};

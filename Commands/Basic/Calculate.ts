import { Client, Message } from "discord.js-selfbot-v13";

export default {
  name: "calculate",
  description: "Calculates a simple math expression.",
  usage: "calculate <expression>",
  execute: (client: Client, message: Message, args: string[]) => {
    if (args.length === 0) {
      return message.reply(
        "Please provide a math expression. Usage: `!calculate <expression>`",
      );
    }

    const Expression = args.join(" ");
    try {
      const result = eval(Expression);
      if (typeof result === "number" && !isNaN(result)) {
        message.reply(`Result: \`${result}\``);
      } else {
        message.reply("Invalid math expression.");
      }
    } catch (error) {
      message.reply("Error calculating expression. Please check your input.");
    }
  },
};

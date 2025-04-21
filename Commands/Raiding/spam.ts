import { Client, Message } from "discord.js-selfbot-v13";
import { Logger } from "../../Utils/Logger";

export default {
  name: "spam",
  description:
    "Spam a message a specified number of times with a delay between each message.",
  usage:
    "spam <Message> <Amount> <Duration>\nExample: !spam \"Hello!\" 5 1000 (spams 'Hello!' 5 times, 1 second apart)",
  execute: async (client: Client, message: Message, args: string[]) => {
    try {
      if (args.length < 3) {
        await message.reply(
          '```\nUsage: !spam <Message> <Amount> <Duration>\nExample: !spam "Hello!" 5 1000\n```',
        );
        return;
      }

      const SpamMsg = args[0];
      const Amt = parseInt(args[1]);
      const Dur = parseInt(args[2]);

      if (isNaN(Amt) || isNaN(Dur) || Amt <= 0 || Dur < 0) {
        await message.reply(
          "```\nAmount must be a positive number and Duration must be a non-negative number.\n```",
        );
        return;
      }

      if (Amt > 50) {
        await message.reply(
          "```\nAmount cannot exceed 50 for safety reasons.\n```",
        );
        return;
      }

      await message.reply("```\nStarting spam...\n```");

      const spam = async (count: number) => {
        if (count >= Amt) return;

        await message.channel.send(SpamMsg);
        setTimeout(() => spam(count + 1), Dur);
      };

      await spam(0);
    } catch (error) {
      Logger.error(`Error in spam command: ${(error as Error).message}`);
      await message.reply("```\n❌ An error occurred while spamming\n```");
    }
  },
};

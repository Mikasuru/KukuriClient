import { Client, Message } from "discord.js-selfbot-v13";

let ReactEnable = false;
let ReactEmoji = "";

export default {
  name: "autoreact",
  description: "Automatically reacts to messages with a specified emoji.",
  usage: "autoreact <on|off> [emoji]",
  execute: (client: Client, message: Message, args: string[]) => {
    const SubCmd = args[0]?.toLowerCase();

    if (SubCmd === "on") {
      const emoji = args[1];
      if (!emoji)
        return message.reply("Please provide an emoji to react with.");
      ReactEnable = true;
      ReactEmoji = emoji;
      message.reply(`Auto react enabled with emoji: ${emoji}`);
    } else if (SubCmd === "off") {
      ReactEnable = false;
      ReactEmoji = "";
      message.reply("Auto react disabled.");
    } else {
      message.reply("Invalid command. Usage: autoreact <on|off> [emoji]");
    }
  },
};

export { ReactEnable, ReactEmoji };

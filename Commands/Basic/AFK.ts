import { Client, Message } from "discord.js-selfbot-v13";

const afkStatus = new Map<string, string>();

export default {
  name: "afk",
  description: "Sets your status to AFK or removes it.",
  usage: "afk [reason]",
  execute: (client: Client, message: Message, args: string[]) => {
    const userId = message.author.id;

    if (afkStatus.has(userId)) {
      afkStatus.delete(userId);
      client.user?.setAFK(false);
      message.reply("You are no longer AFK.");
    } else {
      const reason = args.join(" ") || "No reason provided.";
      afkStatus.set(userId, reason);
      client.user?.setAFK(true);
      message.reply(`You are now AFK. Reason: ${reason}`);
    }
  }
};

export { afkStatus };
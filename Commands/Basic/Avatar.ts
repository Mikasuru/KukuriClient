import { Client, Message } from "discord.js-selfbot-v13";

export default {
  name: "avatar",
  description: "Displays the avatar of a user.",
  usage: "avatar [user]",
  execute: (client: Client, message: Message, args: string[]) => {
    const User =
      message.mentions.users.first() ||
      client.users.cache.get(args[0]) ||
      message.author;
    message.reply(User.displayAvatarURL({ dynamic: true, size: 4096 }));
  },
};

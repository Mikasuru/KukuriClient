import { Client, Message } from "discord.js-selfbot-v13";
import { Logger } from "../../Utils/Logger";

export default {
  name: "nick",
  description: "Manage user nicknames",
  usage: "nick <set/reset/random> <@user> [nickname]",
  execute: async (client: Client, message: Message, args: string[]) => {
    try {
      if (!message.guild) {
        await message.reply("This command can only be used in a server");
        return;
      }

      if (!args[0]) {
        await message.reply(
          "Usage:\n" +
            "!nick set @user [nickname] - Set user's nickname\n" +
            "!nick reset @user - Reset user's nickname\n" +
            "!nick random @user - Set random nickname",
        );
        return;
      }

      const action = args[0].toLowerCase();
      const member = message.mentions.members?.first();

      if (!member) {
        await message.reply("Please mention a user");
        return;
      }

      if (!member.manageable) {
        await message.reply("I cannot manage this user's nickname");
        return;
      }

      switch (action) {
        case "set": {
          const newNick = args.slice(2).join(" ");
          if (!newNick) {
            await message.reply("Please provide a new nickname");
            return;
          }

          if (newNick.length > 32) {
            await message.reply("Nickname must be 32 characters or less");
            return;
          }

          await member.setNickname(newNick);
          await message.channel.send(
            `Changed ${member.user.username}'s nickname to ${newNick}`,
          );
          break;
        }

        case "reset": {
          const oldNick = member.nickname;
          await member.setNickname(null);
          await message.channel.send(
            `Reset ${member.user.username}'s nickname ${oldNick ? `from ${oldNick}` : ""}`,
          );
          break;
        }

        case "random": {
          const adjectives = [
            "Sigma",
            "Maxxing",
            "Alpha",
            "Skibidi",
            "Ohio",
            "Rizzler",
          ];
          const nouns = ["Toilet", "Skibidi", "Wolf", "Kukuri"];
          const randomNick = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${
            nouns[Math.floor(Math.random() * nouns.length)]
          }`;
          await member.setNickname(randomNick);
          await message.channel.send(
            `Changed ${member.user.username}'s nickname to ${randomNick}`,
          );
          break;
        }

        default: {
          await message.reply("Invalid action. Use !nick for help");
        }
      }
    } catch (error) {
      Logger.error(`Error in nick command: ${error}`);
      await message.reply("An error occurred while managing nickname");
    }
  },
};
